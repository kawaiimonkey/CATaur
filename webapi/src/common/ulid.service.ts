import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';

/**
 * ULID Generator Service
 * Generates Universally Unique Lexicographically Sortable Identifiers
 * - 26 characters (vs UUID's 36)
 * - Lexicographically sortable
 * - Timestamp-based
 * - Case insensitive, URL safe
 */
@Injectable()
export class UlidService {
    /**
     * Generate a new ULID
     * Example: 01ARZ3NDEKTSV4RRFFQ69G5FAV
     */
    generate(): string {
        return ulid();
    }

    /**
     * Generate a ULID with a specific timestamp
     * Useful for testing or backdating
     */
    generateAt(timestamp: number): string {
        return ulid(timestamp);
    }
}
