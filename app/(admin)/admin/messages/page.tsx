import Link from "next/link";
import { dbConnect } from "@/lib/db/connect";
import {
  ContactMessage,
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageStatus,
} from "@/lib/db/models/ContactMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { updateMessage, markMessageRead, deleteMessage } from "./actions";
import { AlertTriangle, Inbox, Mail, Reply, Trash2, User as UserIcon } from "lucide-react";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  read: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  spam: "bg-red-100 text-red-800",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "resolved", label: "Resolved" },
  { value: "spam", label: "Spam" },
] as const;

export default async function MessagesPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const requestedStatus = sp?.status as string | undefined;
  const activeFilter =
    requestedStatus && CONTACT_MESSAGE_STATUSES.includes(requestedStatus as ContactMessageStatus)
      ? (requestedStatus as ContactMessageStatus)
      : "all";
  const query = activeFilter === "all" ? {} : { status: activeFilter };

  await dbConnect();

  const [messageDocs, total, newCount] = await Promise.all([
    ContactMessage.find(query).sort({ createdAt: -1 }).skip(offset).limit(PAGE_SIZE),
    ContactMessage.countDocuments(query),
    ContactMessage.countDocuments({ status: "new" }),
  ]);

  const messages = messageDocs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject ?? "Contact Form Inquiry",
    message: doc.message,
    status: doc.status,
    admin_notes: doc.adminNotes ?? null,
    email_delivered: doc.emailDelivered !== false,
    is_registered: Boolean(doc.userId),
    created_at: doc.createdAt ? doc.createdAt.toISOString() : null,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Customer enquiries submitted through the contact form.
          {newCount > 0 ? ` ${newCount} awaiting a first read.` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.value;
          const href =
            filter.value === "all" ? "/admin/messages" : `/admin/messages?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-black bg-black text-white"
                  : "border-input bg-background text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              }`}
            >
              {filter.label}
              {filter.value === "new" && newCount > 0 ? (
                <span className="ml-1.5 text-xs">({newCount})</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === "all"
              ? "All messages"
              : `${activeFilter.charAt(0).toUpperCase()}${activeFilter.slice(1)} messages`}{" "}
            <span className="text-sm font-normal text-muted-foreground">({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">
                {activeFilter === "all"
                  ? "No messages yet."
                  : `No ${activeFilter} messages.`}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="rounded-xl border p-4 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{msg.subject}</p>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          STATUS_COLORS[msg.status] || "bg-gray-100"
                        }`}
                      >
                        {msg.status}
                      </span>
                      {!msg.email_delivered && (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          <AlertTriangle className="h-3 w-3" />
                          Email failed
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" />
                        {msg.name}
                        {msg.is_registered ? (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                            Registered
                          </span>
                        ) : null}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${msg.email}`} className="underline hover:text-foreground">
                          {msg.email}
                        </a>
                      </p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>

                    {msg.admin_notes ? (
                      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                        <p className="font-semibold">Internal notes</p>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {msg.admin_notes}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                    <p className="text-xs text-muted-foreground">
                      {msg.created_at
                        ? new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(msg.created_at))
                        : ""}
                    </p>
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply by email
                    </a>
                    {msg.status === "new" && (
                      <form action={markMessageRead}>
                        <input type="hidden" name="messageId" value={msg.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        >
                          Mark as read
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-4 md:grid-cols-[1fr_auto]">
                  <form action={updateMessage} className="grid gap-2" id={`update-${msg.id}`}>
                    <input type="hidden" name="messageId" value={msg.id} />
                    <Label htmlFor={`status-${msg.id}`}>Status</Label>
                    <select
                      id={`status-${msg.id}`}
                      name="status"
                      defaultValue={msg.status}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                      <option value="spam">Spam</option>
                    </select>
                    <Label htmlFor={`notes-${msg.id}`} className="pt-2">
                      Internal notes
                    </Label>
                    <textarea
                      id={`notes-${msg.id}`}
                      name="notes"
                      rows={2}
                      defaultValue={msg.admin_notes ?? ""}
                      placeholder="Not shown to the customer"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </form>

                  <div className="flex items-end gap-2">
                    <Button type="submit" form={`update-${msg.id}`}>
                      Save
                    </Button>
                    <form action={deleteMessage}>
                      <input type="hidden" name="messageId" value={msg.id} />
                      <Button type="submit" variant="destructive" size="icon" aria-label="Delete message">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {total > PAGE_SIZE && (
        <div className="flex justify-center">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      )}
    </section>
  );
}
