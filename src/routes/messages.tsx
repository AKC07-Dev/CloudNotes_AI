import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MessageSquare, Search, Send, Smile, Paperclip } from "lucide-react";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

function MessagesPage() {
  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <div className="glass rounded-3xl overflow-hidden grid md:grid-cols-[320px_1fr] h-[calc(100vh-160px)] min-h-[560px]">
          {/* List */}
          <div className="border-r border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-semibold text-lg font-display">Messages</h2>
              <div className="mt-3 glass rounded-xl px-3 h-10 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search chats…"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
              <div>
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>No conversations yet.</p>
              </div>
            </div>
          </div>

          {/* Conversation placeholder */}
          <div className="flex flex-col">
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
              <div>
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-xs mt-1 opacity-60">Messaging backend coming soon.</p>
              </div>
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="glass rounded-xl flex items-center gap-2 px-3 h-12 opacity-50">
                <button className="h-8 w-8 grid place-items-center rounded-lg" disabled>
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  placeholder="Select a conversation to chat…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  disabled
                />
                <button className="h-8 w-8 grid place-items-center rounded-lg" disabled>
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 grid place-items-center rounded-lg bg-primary/50 text-primary-foreground"
                  disabled
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
