import { Button } from "@/components/ui/button";
import { Section } from "@/components/recruiter/cards";
import {
  Bot,
  Sparkles,
  FileText,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  Send,
  Zap,
  Target,
  BookOpen,
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
    message: "Absolutely! I've analyzed the job description and your profile. For the Senior Backend Engineer role at Maple Fintech, you should focus on: 1) Event-driven microservices architecture, 2) Go concurrency patterns, 3) PostgreSQL optimization strategies. Would you like me to create a custom prep guide?",
    time: "10:31 AM",
  },
  {
    role: "user",
    message: "Yes, that would be great! Also, can you suggest some metrics from my experience to highlight?",
    time: "10:32 AM",
  },
  {
    role: "assistant",
    message: "Perfect! Here are your strongest metrics to emphasize:\n\n• 42% reduction in P95 latency through PostgreSQL query optimization\n• 99.95% uptime maintained across Kubernetes clusters\n• Led migration of 5-person team to cloud-native architecture\n\nThese align perfectly with Maple Fintech's focus on scalability and reliability.",
    time: "10:33 AM",
  },
];

const AI_TOOLS = [
  {
    title: "Interview Preparation",
    description: "Get personalized prep guides, practice questions, and company insights",
    icon: Target,
    color: "bg-primary",
  },
  {
    title: "Resume Optimization",
    description: "AI-powered suggestions to improve your resume for specific roles",
    icon: FileText,
    color: "bg-accent",
  },
  {
    title: "Salary Negotiation",
    description: "Market data and strategies for compensation discussions",
    icon: TrendingUp,
    color: "bg-success",
  },
  {
    title: "Career Coaching",
    description: "Personalized advice on career growth and job search strategy",
    icon: Lightbulb,
    color: "bg-warning",
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Chat - 2 columns */}
          <div className="lg:col-span-2">
            <Section
              title="AI Chat"
              subtitle="Ask me anything about your career"
              icon={<MessageCircle className="h-5 w-5" />}
            >
              <div className="flex h-[600px] flex-col">
                {/* Chat messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  {CHAT_HISTORY.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${chat.role === "user"
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-white text-slate-900"
                          }`}
                      >
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          {chat.role === "assistant" && <Bot className="h-3 w-3" />}
                          <span>{chat.role === "assistant" ? "AI Assistant" : "You"}</span>
                          <span>•</span>
                          <span>{chat.time}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                          {chat.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="border-t border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask me anything about your career..."
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button variant="primary" size="md" className="px-6">
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>

                  {/* Quick actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action, idx) => (
                      <button
                        key={idx}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition cursor-pointer hover:border-primary cursor-pointer hover:text-primary"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* AI Tools */}
            <Section
              title="AI Tools"
              subtitle="Explore what I can do"
              icon={<Zap className="h-5 w-5" />}
            >
              <div className="space-y-4 p-6">
                {AI_TOOLS.map((tool, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${tool.color} shadow-md`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary">{tool.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Recent Insights */}
            <Section
              title="Recent Insights"
              icon={<Lightbulb className="h-5 w-5" />}
            >
              <div className="space-y-4 p-6">
                <div className="rounded-lg bg-gradient-primary p-4 text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-sm font-semibold">Interview Prep Ready</p>
                  </div>
                  <p className="mt-2 text-xs text-white/90">
                    Your personalized prep guide for Maple Fintech is ready to review
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 border-white/30 bg-white/10 text-white cursor-pointer hover:bg-white/20">
                    View Guide
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-secondary">Resume Updated</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    3 improvements applied to strengthen your profile
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary">
                    Review Changes
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <p className="text-sm font-semibold text-secondary">Market Insights</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Senior Engineer salaries in Toronto: $140K-$180K
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary">
                    View Details
                  </Button>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
