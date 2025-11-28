"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bug } from "lucide-react";
import { submitBugReport } from "@/lib/api/bug";
import toast from "react-hot-toast";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEVELOPERS = [
  "Anandteertha",
  "Advait",
  "Adit",
  "Kavya"
];

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "medium",
    assignedTo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in the title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitBugReport(formData);
      toast.success("Bug report submitted successfully!");
      setFormData({
        title: "",
        description: "",
        stepsToReproduce: "",
        expectedBehavior: "",
        actualBehavior: "",
        severity: "medium",
        assignedTo: "",
      });
      onClose();
    } catch (error: any) {
      console.error("Failed to submit bug report:", error);
      toast.error(error.message || "Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl p-6 border shadow-2xl"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--orange)]/10">
                    <Bug className="h-6 w-6 text-[var(--orange)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">
                      Report a Bug
                    </h2>
                    <p className="text-sm text-[var(--text-subtle)]">
                      Help us improve Howl2Go
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X size={20} className="text-[var(--text-subtle)]" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Bug Title <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the bug"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Description <span className="text-[var(--error)]">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the bug in detail..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>

                {/* Expected vs Actual Behavior */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                      placeholder="What should happen?"
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                      placeholder="What actually happens?"
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                </div>

                {/* Severity and Assign To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Assign To Developer
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
                      style={{
                        backgroundColor: "var(--bg-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      <option value="">Select a developer (optional)</option>
                      {DEVELOPERS.map((dev) => (
                        <option key={dev} value={dev}>
                          {dev}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-[var(--orange)] text-[var(--bg)] hover:bg-[var(--cream)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Bug Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

