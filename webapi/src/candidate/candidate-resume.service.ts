import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Candidate } from '../database/entities/candidate.entity';
import { ResumeParser } from '../database/entities/resume-parser.entity';
import { User } from '../database/entities/user.entity';
import { UlidService } from '../common/ulid.service';
import { EncryptionService } from '../common/encryption.service';
import { ParseResumeDto } from './dto/parse-resume.dto';
import { ApplyResumeDto } from './dto/apply-resume.dto';

type ParsedResumeData = {
    basics: {
        fullName: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        linkedinUrl: string | null;
        portfolioUrl: string | null;
    };
    summary: string | null;
    skills: string[];
    experiences: Array<{
        jobTitle: string | null;
        companyName: string | null;
        startDate: string | null;
        endDate: string | null;
        isCurrent: boolean;
        description: string | null;
    }>;
    education: Array<{
        institutionName: string | null;
        degree: string | null;
        fieldOfStudy: string | null;
        startDate: string | null;
        endDate: string | null;
    }>;
    availability: {
        noticePeriodDays: number | null;
        availableDate: string | null;
    };
    extractedAt: string;
};

@Injectable()
export class CandidateResumeService {
    constructor(
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>,
        @InjectRepository(ResumeParser)
        private readonly resumeParserRepository: Repository<ResumeParser>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly ulidService: UlidService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async parseResume(userId: string, dto: ParseResumeDto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
        if (!user) {
            throw new NotFoundException('Candidate user not found');
        }

        const candidate = await this.ensureCandidate(userId);
        const rawText = await this.resolveResumeText(dto);
        const normalizedText = this.normalizeWhitespace(rawText);
        const warnings = this.buildWarnings(dto, normalizedText);
        const parsedData = this.parseStructuredData(normalizedText);
        const confidence = this.calculateConfidence(parsedData);
        const encryptedPayload = this.encryptionService.encryptJson(parsedData);
        const resolvedResumeUrl = dto.resumeUrl ? this.resolveResumeUrl(dto.resumeUrl) : candidate.resumeUrl;

        const parser = this.resumeParserRepository.create({
            id: this.ulidService.generate(),
            candidateId: candidate.id,
            resumeUrl: resolvedResumeUrl,
            parsedData: encryptedPayload,
            rawTextPreview: normalizedText.slice(0, 4000),
            warnings,
            confidence,
            status: 'parsed',
        });

        await this.resumeParserRepository.save(parser);

        return this.toParserResponse(parser, parsedData);
    }

    async applyParsedResume(userId: string, dto: ApplyResumeDto) {
        const candidate = await this.ensureCandidate(userId);
        const parser = await this.resumeParserRepository.findOne({
            where: { id: dto.parserId, candidateId: candidate.id },
        });

        if (!parser || !parser.parsedData) {
            throw new NotFoundException('Parsed resume not found');
        }

        const parsedData = this.encryptionService.decryptJson<ParsedResumeData>(parser.parsedData);

        if (dto.applyMode === 'overwrite' || !candidate.portfolioUrl) {
            candidate.portfolioUrl = parsedData.basics.portfolioUrl;
        }
        if (dto.applyMode === 'overwrite' || !candidate.currentLocation) {
            candidate.currentLocation = parsedData.basics.location;
        }
        if (dto.applyMode === 'overwrite' || candidate.noticePeriod === null || candidate.noticePeriod === undefined) {
            candidate.noticePeriod = parsedData.availability.noticePeriodDays;
        }
        if (dto.applyMode === 'overwrite' || !candidate.availableDate) {
            candidate.availableDate = parsedData.availability.availableDate;
        }
        if (dto.applyMode === 'overwrite' || !candidate.resumeUrl) {
            candidate.resumeUrl = parser.resumeUrl;
        }
        candidate.profileStatus = 'resume_applied';

        await this.candidateRepository.save(candidate);

        await this.resumeParserRepository.update(
            { candidateId: candidate.id, status: 'applied' },
            { status: 'superseded' },
        );

        parser.status = 'applied';
        await this.resumeParserRepository.save(parser);

        return {
            candidate,
            parser: this.toParserResponse(parser, parsedData),
        };
    }

    async getLatestResume(userId: string) {
        const candidate = await this.ensureCandidate(userId);
        const parser = await this.resumeParserRepository.findOne({
            where: { candidateId: candidate.id },
            order: { parseDate: 'DESC' },
        });

        if (!parser) {
            return {
                candidate,
                latestResume: null,
            };
        }

        return {
            candidate,
            latestResume: this.toParserResponse(parser),
        };
    }

    async getResumeParse(userId: string, parserId: string) {
        const candidate = await this.ensureCandidate(userId);
        const parser = await this.resumeParserRepository.findOne({
            where: { id: parserId, candidateId: candidate.id },
        });

        if (!parser) {
            throw new NotFoundException('Parsed resume not found');
        }

        return this.toParserResponse(parser);
    }

    private async ensureCandidate(userId: string): Promise<Candidate> {
        const existing = await this.candidateRepository.findOne({ where: { id: userId } });
        if (existing) {
            return existing;
        }

        const candidate = this.candidateRepository.create({
            id: userId,
            resumeUrl: null,
            portfolioUrl: null,
            currentLocation: null,
            noticePeriod: null,
            availableDate: null,
            profileStatus: 'draft',
        });

        return this.candidateRepository.save(candidate);
    }

    private async resolveResumeText(dto: ParseResumeDto): Promise<string> {
        if (dto.rawText?.trim()) {
            return dto.rawText.trim();
        }

        if (!dto.resumeUrl) {
            throw new BadRequestException('Either rawText or resumeUrl is required');
        }

        let response;
        try {
            response = await axios.get<ArrayBuffer>(this.resolveResumeUrl(dto.resumeUrl), {
                responseType: 'arraybuffer',
            });
        } catch {
            throw new BadRequestException('Failed to fetch resume content from resumeUrl');
        }

        const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
        if (contentType && !contentType.startsWith('text/') && !contentType.includes('json')) {
            throw new BadRequestException('Only raw text parsing is supported in the current MVP. Provide rawText for PDF or DOCX resumes.');
        }

        return Buffer.from(response.data).toString('utf8').trim();
    }

    private resolveResumeUrl(resumeUrl: string): string {
        if (/^https?:\/\//i.test(resumeUrl)) {
            return resumeUrl;
        }

        const fileServiceUrl = this.configService.get<string>('FILE_SERVICE_URL');
        const appOrigin = this.configService.get<string>('WEBAUTHN_ORIGIN');
        const baseUrl = fileServiceUrl || appOrigin;

        if (!baseUrl) {
            throw new BadRequestException('Relative resumeUrl requires FILE_SERVICE_URL or WEBAUTHN_ORIGIN in configuration');
        }

        return new URL(resumeUrl, baseUrl).toString();
    }

    private buildWarnings(dto: ParseResumeDto, rawText: string): string[] {
        const warnings: string[] = [];
        if (dto.resumeUrl && !dto.rawText) {
            warnings.push('resumeUrl parsing currently supports text-based content only; use rawText for PDF or DOCX files.');
        }
        if (rawText.length < 120) {
            warnings.push('Very little text was available, so some fields may be incomplete.');
        }
        return warnings;
    }

    private parseStructuredData(rawText: string): ParsedResumeData {
        const lines = rawText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
        const phone = rawText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? null;
        const linkedinUrl = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0] ?? null;
        const portfolioUrl = rawText.match(/https?:\/\/(?![^\s]*linkedin)(?:www\.)?[^\s]+/i)?.[0] ?? null;
        const fullName = this.extractFullName(lines, email);
        const location = this.extractLocation(lines);
        const summary = this.extractSection(rawText, ['summary', 'profile', 'professional summary'], ['experience', 'skills', 'education']);
        const skills = this.extractSkills(rawText);
        const experiences = this.extractExperiences(rawText);
        const education = this.extractEducation(rawText);
        const availability = this.extractAvailability(rawText);

        return {
            basics: {
                fullName,
                email,
                phone,
                location,
                linkedinUrl,
                portfolioUrl,
            },
            summary,
            skills,
            experiences,
            education,
            availability,
            extractedAt: new Date().toISOString(),
        };
    }

    private extractFullName(lines: string[], email: string | null): string | null {
        for (const line of lines.slice(0, 8)) {
            if (email && line.includes(email)) {
                continue;
            }
            if (/^[A-Za-z][A-Za-z ,.'-]{2,60}$/.test(line) && line.split(/\s+/).length <= 4) {
                return line;
            }
        }
        return null;
    }

    private extractLocation(lines: string[]): string | null {
        const locationLine = lines.find((line) => /(?:,\s*)?(AB|BC|ON|QC|Alberta|British Columbia|Ontario|Canada|USA|United States)$/i.test(line));
        return locationLine ?? null;
    }

    private extractSkills(rawText: string): string[] {
        const section = this.extractSection(rawText, ['skills', 'technical skills', 'core competencies'], ['experience', 'education', 'projects']);
        const source = section ?? rawText;
        const tokens = source
            .split(/[\n,|•]/)
            .map((token) => token.trim())
            .filter((token) => token.length > 1 && token.length < 40);

        const unique = Array.from(new Set(tokens.filter((token) => /[A-Za-z]/.test(token))));
        return unique.slice(0, 20);
    }

    private extractExperiences(rawText: string) {
        const section = this.extractSection(rawText, ['experience', 'work experience', 'employment history'], ['education', 'skills', 'projects']);
        if (!section) {
            return [];
        }

        const blocks = section
            .split(/\n\s*\n/)
            .map((block) => this.normalizeWhitespace(block))
            .filter(Boolean)
            .slice(0, 6);

        return blocks.map((block) => {
            const parts = block.split(' - ');
            const dateMatch = block.match(/((?:19|20)\d{2}(?:[-/]\d{2})?)\s*(?:to|-|–)\s*((?:present|current|now)|(?:19|20)\d{2}(?:[-/]\d{2})?)/i);
            return {
                jobTitle: parts[0] ?? null,
                companyName: parts[1] ?? null,
                startDate: dateMatch?.[1] ?? null,
                endDate: dateMatch?.[2] ?? null,
                isCurrent: Boolean(dateMatch?.[2] && /present|current|now/i.test(dateMatch[2])),
                description: block,
            };
        });
    }

    private extractEducation(rawText: string) {
        const section = this.extractSection(rawText, ['education'], ['experience', 'skills', 'projects']);
        if (!section) {
            return [];
        }

        const blocks = section
            .split(/\n\s*\n/)
            .map((block) => this.normalizeWhitespace(block))
            .filter(Boolean)
            .slice(0, 4);

        return blocks.map((block) => {
            const yearMatch = block.match(/((?:19|20)\d{2})\s*(?:to|-|–)\s*((?:19|20)\d{2}|present)/i);
            return {
                institutionName: block.split(',')[0] ?? null,
                degree: block.match(/(Bachelor|Master|Diploma|Certificate|B\.Sc|M\.Sc|BSc|MSc|PhD|Doctor)/i)?.[0] ?? null,
                fieldOfStudy: block.match(/(?:in|of)\s+([A-Za-z &/]+)/i)?.[1]?.trim() ?? null,
                startDate: yearMatch?.[1] ?? null,
                endDate: yearMatch?.[2] ?? null,
            };
        });
    }

    private extractAvailability(rawText: string): { noticePeriodDays: number | null; availableDate: string | null } {
        const availableDateRaw = rawText.match(/available\s+(?:from|on)?\s*((?:19|20)\d{2}-\d{2}-\d{2}|[A-Za-z]+\s+\d{4})/i)?.[1] ?? null;
        const noticeWeeks = rawText.match(/(\d+)\s*week(?:s)?\s*notice/i)?.[1];
        const noticeDays = rawText.match(/(\d+)\s*day(?:s)?\s*notice/i)?.[1];

        return {
            noticePeriodDays: noticeDays ? Number(noticeDays) : noticeWeeks ? Number(noticeWeeks) * 7 : null,
            availableDate: this.toStorageDate(availableDateRaw),
        };
    }

    private extractSection(rawText: string, startMarkers: string[], endMarkers: string[]): string | null {
        const lowerText = rawText.toLowerCase();
        let startIndex = -1;

        for (const marker of startMarkers) {
            const index = lowerText.indexOf(marker.toLowerCase());
            if (index !== -1 && (startIndex === -1 || index < startIndex)) {
                startIndex = index;
            }
        }

        if (startIndex === -1) {
            return null;
        }

        let endIndex = rawText.length;
        for (const marker of endMarkers) {
            const index = lowerText.indexOf(marker.toLowerCase(), startIndex + 1);
            if (index !== -1 && index < endIndex) {
                endIndex = index;
            }
        }

        const section = rawText.slice(startIndex, endIndex).trim();
        return section.length ? section : null;
    }

    private calculateConfidence(parsedData: ParsedResumeData): number {
        let score = 0;
        const possible = 8;

        if (parsedData.basics.fullName) score += 1;
        if (parsedData.basics.email) score += 1;
        if (parsedData.basics.phone) score += 1;
        if (parsedData.basics.location) score += 1;
        if (parsedData.skills.length) score += 1;
        if (parsedData.experiences.length) score += 1;
        if (parsedData.education.length) score += 1;
        if (parsedData.summary) score += 1;

        return Number(((score / possible) * 100).toFixed(2));
    }

    private toStorageDate(value: string | null): string | null {
        if (!value) {
            return null;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const monthYearMatch = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
        if (!monthYearMatch) {
            return null;
        }

        const parsed = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
        const day = String(parsed.getUTCDate()).padStart(2, '0');
        return `${parsed.getUTCFullYear()}-${month}-${day}`;
    }

    private normalizeWhitespace(text: string): string {
        return text
            .replace(/\r/g, '')
            .replace(/\t/g, ' ')
            .replace(/\u00a0/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    private toParserResponse(parser: ResumeParser, parsedData?: ParsedResumeData) {
        const decrypted = parsedData ?? (parser.parsedData
            ? this.encryptionService.decryptJson<ParsedResumeData>(parser.parsedData)
            : null);

        return {
            id: parser.id,
            candidateId: parser.candidateId,
            resumeUrl: parser.resumeUrl,
            status: parser.status,
            confidence: parser.confidence === null ? null : Number(parser.confidence),
            parseDate: parser.parseDate,
            warnings: parser.warnings ?? [],
            rawTextPreview: parser.rawTextPreview,
            parsedData: decrypted,
        };
    }
}
