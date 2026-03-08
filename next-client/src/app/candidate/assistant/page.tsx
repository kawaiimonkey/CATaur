"use client";

import { GuestGate } from "@/components/candidate/guest-gate";
import { Button } from "@/components/ui/button";
import {
  Bot,
  FileText,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  Send,
  Zap,
  Target,
} from "lucide-react";

const CHAT_HISTORY = [
  {
    role: "assistant",
    message: "Hi! I'm your AI career assistant. How can I help you today?",
    time: "10:30 AM",
  },
  {
    role: "user",
    message: "Can you help me prepare for my upcoming interview with Maple Fintech?",
    time: "10:31 AM",
  },
  {
    role: "assistant",
    message:
      "Absolutely! I've analyzed the job description and your profile. For the Senior Backend Engineer role at Maple Fintech, you should focus on: 1) Event-driven microservices architecture, 2) Go concurrency patterns, 3) PostgreSQL optimization strategies. Would you like me to create a custom prep guide?",
    time: "10:31 AM",
  },
  {
    role: "user",
    message:
      "Yes, that would be great! Also, can you suggest some metrics from my experience to highlight?",
    time: "10:32 AM",
  },
  {
    role: "assistant",
    message:
      "Perfect! Here are your strongest metrics to emphasize:\n\n• 42% reduction in P95 latency through PostgreSQL query optimization\n• 99.95% uptime maintained across Kubernetes clusters\n• Led migration of 5-person team to cloud-native architecture\n\nThese align perfectly with Maple Fintech's focus on scalability and reliability.",
    time: "10:33 AM",
  },
];

const AI_TOOLS = [
  {
    title: "Interview Preparation",
    description: "Get personalized prep guides, practice questions, and company insights",
    icon: Target,
  },
  {
    title: "Resume Optimization",
    description: "AI-powered suggestions to improve your resume for specific roles",
    icon: FileText,
  },
  {
    title: "Salary Negotiation",
    description: "Market data and strategies for compensation discussions",
    icon: TrendingUp,
  },
  {
    title: "Career Coaching",
    description: "Personalized advice on career growth and job search strategy",
    icon: Lightbulb,
  },
];

const QUICK_ACTIONS = [
  "Prepare for system design interview",
  "Review my resume",
  "Salary ranges for Senior Engineer in Toronto",
  "Tips for behavioral interviews",
];

export default function AssistantPage() {
  return (
    <GuestGate>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#111827]">AI Assistant</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Get personalized career guidance, interview prep, and more.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-[var(--border-light)] bg-white">
              {/* Panel header */}
              <div className="flex items-center gap-2 border-b border-[var(--border-light)] px-5 py-3">
                <MessageCircle className="h-4 w-4 text-[#1D4ED8]" />
                <span className="text-sm font-medium text-[#111827]">AI Chat</span>
                <span className="ml-1 text-xs text-[#6B7280]">— Ask me anything about your career</span>
              </div>

              <div className="flex h-[560px] flex-col">
                {/* Chat messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {CHAT_HISTORY.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg border px-4 py-3 ${chat.role === "user"
                          ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                          : "border-[var(--border-light)] bg-white text-[#111827]"
                          }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-xs ${chat.role === "user" ? "text-white/70" : "text-[#6B7280]"
                            }`}
                        >
                          {chat.role === "assistant" && <Bot className="h-3 w-3" />}
                          <span>{chat.role === "assistant" ? "AI Assistant" : "You"}</span>
                          <span>·</span>
                          <span>{chat.time}</span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
                          {chat.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="border-t border-[var(--border-light)] bg-[#F9FAFB] p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me anything about your career..."
                      className="flex-1 rounded border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#6B7280] transition focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                    />
                    <Button variant="primary" size="sm" className="gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button
                        key={idx}
                        className="rounded border border-[var(--border-light)] bg-white px-2.5 py-1 text-xs text-[#374151] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Tools */}
            <div className="rounded-lg border border-[var(--border-light)] bg-white">
              <div className="flex items-center gap-2 border-b border-[var(--border-light)] px-5 py-3">
                <Zap className="h-4 w-4 text-[#1D4ED8]" />
                <span className="text-sm font-medium text-[#111827]">AI Tools</span>
              </div>
              <div className="divide-y divide-[var(--border-light)]">
                {AI_TOOLS.map((tool, idx) => (
                  <button
                    key={idx}
                    className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-[#F9FAFB]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF]">
                      <tool.icon className="h-4 w-4 text-[#1D4ED8]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#111827]">{tool.title}</p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Insights */}
            <div className="rounded-lg border border-[var(--border-light)] bg-white">
              <div className="flex items-center gap-2 border-b border-[var(--border-light)] px-5 py-3">
                <Lightbulb className="h-4 w-4 text-[#1D4ED8]" />
                <span className="text-sm font-medium text-[#111827]">Recent Insights</span>
              </div>
              <div className="divide-y divide-[var(--border-light)]">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-[#1D4ED8]" />
                      <p className="text-xs font-semibold text-[#111827]">Interview Prep Ready</p>
                    </div>
                    <span className="rounded border border-[#BFDBFE] bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#1E40AF]">
                      New
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B7280]">
                    Your personalized prep guide for Maple Fintech is ready to review.
                  </p>
                  <button className="mt-2 text-xs font-medium text-[#1D4ED8] hover:underline">
                    View Guide →
                  </button>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[#6B7280]" />
                    <p className="text-xs font-semibold text-[#111827]">Resume Updated</p>
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B7280]">
                    3 improvements applied to strengthen your profile.
                  </p>
                  <button className="mt-2 text-xs font-medium text-[#1D4ED8] hover:underline">
                    Review Changes →
                  </button>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-[#6B7280]" />
                    <p className="text-xs font-semibold text-[#111827]">Market Insights</p>
                  </div>
                  <p className="mt-1.5 text-xs text-[#6B7280]">
                    Senior Engineer salaries in Toronto: $140K–$180K
                  </p>
                  <button className="mt-2 text-xs font-medium text-[#1D4ED8] hover:underline">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestGate>
  );
}

