"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lock, LogOut, Send, AlertTriangle, MonitorCheck, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchStudents, updateStudent, fetchWritingTopic } from "@/app/actions/studentActions";

type Student = {
  name: string;
  id: string;
  division: string;
  isLocked: boolean;
  content: string;
  isSubmitted: boolean;
};

export default function StudentPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [idInput, setIdInput] = useState("");
  const [writingTopic, setWritingTopic] = useState("자율 글쓰기 영역");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const lastSyncRef = useRef<number>(0);

  // Sync state from server periodically
  useEffect(() => {
    const sync = async () => {
      try {
        const topic = await fetchWritingTopic();
        setWritingTopic(topic);
        
        if (student) {
          const all = await fetchStudents();
          const updated = all.find(s => s.id === student.id);
          if (updated) {
            // Only update if something changed from server (lock/submit status)
            if (updated.isLocked !== student.isLocked || updated.isSubmitted !== student.isSubmitted) {
              setStudent(updated);
              localStorage.setItem("currentStudent", JSON.stringify(updated));
            }
          }
        }
      } catch (e) {
        console.error("Sync error", e);
      }
    };

    const interval = setInterval(sync, 3000); // Poll every 3 seconds
    sync(); // Initial sync
    return () => clearInterval(interval);
  }, [student?.id, student?.isLocked, student?.isSubmitted]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("currentStudent");
    if (saved) {
      setStudent(JSON.parse(saved));
    }
  }, []);

  // Sync content back to server
  const syncContentToServer = useCallback(async (s: Student) => {
    const now = Date.now();
    // Sync to server every 2 seconds to avoid overloading
    if (now - lastSyncRef.current > 2000) {
      lastSyncRef.current = now;
      await updateStudent(s.id, { content: s.content });
    }
  }, []);

  // Anti-cheating lock
  useEffect(() => {
    if (!student || student.isLocked || student.isSubmitted) return;

    const lockMe = () => {
      // Use visibilitychange which is more reliable on mobile
      if (document.visibilityState === 'hidden') {
        const current = { ...student, isLocked: true };
        setStudent(current);
        localStorage.setItem("currentStudent", JSON.stringify(current));
        updateStudent(current.id, { isLocked: true });
      }
    };

    const handleBlur = () => {
      // Blur can be accidental on mobile, but we still want to guard
      const current = { ...student, isLocked: true };
      setStudent(current);
      localStorage.setItem("currentStudent", JSON.stringify(current));
      updateStudent(current.id, { isLocked: true });
    };

    document.addEventListener("visibilitychange", lockMe);
    window.addEventListener("blur", handleBlur);
    
    return () => {
      document.removeEventListener("visibilitychange", lockMe);
      window.removeEventListener("blur", handleBlur);
    }
  }, [student]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !idInput) {
      setError("성명과 학번을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const allStudents = await fetchStudents();
      const found = allStudents.find(s => s.name === nameInput && s.id === idInput);

      if (found) {
        setStudent(found);
        localStorage.setItem("currentStudent", JSON.stringify(found));
        setError("");
      } else {
        setError("등록되지 않은 학생입니다. 관리자(교수)에게 문의하세요.");
      }
    } catch (err) {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    setStudent(null);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!student || student.isLocked || student.isSubmitted) return;
    const updated = { ...student, content: e.target.value };
    setStudent(updated);
    syncContentToServer(updated);
  };

  const handleFinalSubmit = async () => {
    if (!student) return;
    if (confirm("최종 제출하시겠습니까? 제출 후에는 수정이 불가능합니다.")) {
      const updated = { ...student, isSubmitted: true };
      setStudent(updated);
      localStorage.setItem("currentStudent", JSON.stringify(updated));
      await updateStudent(updated.id, { isSubmitted: true, content: updated.content });
    }
  };

  if (!student) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-6 md:p-10 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl space-y-6 md:space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">학생 로그인</h1>
            <p className="text-sm md:text-base text-zinc-500 font-medium">배정된 인적사항을 입력하여 입실하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold px-1 text-zinc-600 dark:text-zinc-400">성명</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="홍길동"
                className="w-full h-12 md:h-14 px-4 rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold px-1 text-zinc-600 dark:text-zinc-400">학번</label>
              <input 
                type="text" 
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="20240001"
                className="w-full h-12 md:h-14 px-4 rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-lg"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-accent text-sm font-semibold flex items-center gap-1.5 px-3 py-2 bg-accent/5 rounded-xl border border-accent/10"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.p>
            )}
            <button 
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-14 md:h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
            >
              {isLoading ? "입장 중..." : "시험 시작하기"}
            </button>
          </form>
          <div className="text-center text-[10px] md:text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            Powered by INU Writing Guardian
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground overflow-hidden">
      {/* Header - Optimized for mobile */}
      <header className="flex-shrink-0 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 truncate">
            <span className="font-extrabold text-sm md:text-lg truncate">{student.name}</span>
            <span className="text-[10px] md:text-sm text-zinc-400 font-black truncate">{student.id}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-zinc-500 hover:text-accent hover:bg-accent/5 transition-all text-xs md:text-sm font-black border border-transparent hover:border-accent/10"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </header>

      {/* Editor Content Box */}
      <section className="flex-1 p-2 md:p-8 flex flex-col relative overflow-hidden">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col gap-2 md:gap-6 min-h-0">
          {/* Topic & Char Count */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between px-2 gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <BookOpenText className="w-4 h-4 text-primary" />
              <h2 className="text-base md:text-2xl font-black line-clamp-1">{writingTopic}</h2>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 px-1">
              <div className="text-[10px] md:text-sm font-black uppercase tracking-widest text-zinc-400">
                글자 수: <span className="text-primary">{student.content.length}</span> / 2000
              </div>
            </div>
          </div>
          
          {/* Main Textarea Container - Uses flex-1 to fill space */}
          <div className="flex-1 relative group min-h-0">
            <textarea 
              value={student.content}
              onChange={handleContentChange}
              disabled={student.isLocked || student.isSubmitted}
              spellCheck={false}
              autoFocus
              placeholder={student.isSubmitted ? "제출이 완료되었습니다. 수정할 수 없습니다." : "여기에 성실하게 글을 작성하세요..."}
              className={cn(
                "w-full h-full p-4 md:p-10 rounded-2xl md:rounded-[40px] border-2 text-base md:text-xl leading-relaxed resize-none transition-all duration-300",
                "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-serif",
                student.isLocked 
                  ? "opacity-50 blur-[6px] cursor-not-allowed grayscale" 
                  : student.isSubmitted 
                    ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 shadow-inner" 
                    : "focus:outline-none focus:ring-8 focus:ring-primary/5 shadow-xl md:shadow-2xl"
              )}
            />
            
            {/* Lock Overlay */}
            <AnimatePresence>
              {student.isLocked && !student.isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-2xl md:rounded-[40px] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 md:space-y-6"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <Lock className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-2xl font-black text-accent">접근이 차단되었습니다</h3>
                      <p className="text-xs md:text-sm text-zinc-500 font-bold">
                        창 전환 또는 외부 요인이 감지되었습니다. <br />
                        교수님의 확인 후 해제가 가능합니다.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] md:text-xs font-bold text-zinc-400">
                      <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                      잠금 해제 대기 중...
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submitted Overlay */}
            <AnimatePresence>
              {student.isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-4 md:bottom-10 right-4 md:right-10 pointer-events-none"
                >
                  <div className="bg-emerald-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-lg flex items-center gap-2 md:gap-3 shadow-2xl shadow-emerald-500/30">
                    <MonitorCheck className="w-4 h-4 md:w-6 md:h-6" />
                    제출 완료됨
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Submit Button Area */}
          <div className="flex justify-end gap-3 px-1 md:px-2 flex-shrink-0">
            {!student.isSubmitted ? (
              <button 
                onClick={handleFinalSubmit}
                disabled={student.isLocked}
                className="group flex items-center gap-2 px-6 md:px-10 h-14 md:h-16 rounded-2xl md:rounded-3xl bg-primary text-white font-black text-sm md:text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                최종 제출하기
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 md:px-10 h-14 md:h-16 rounded-2xl md:rounded-3xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-black text-sm md:text-xl opacity-60">
                <Send className="w-4 h-4 md:w-6 md:h-6" />
                최종 제출 완료
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Support for orientation hint */}
      <div className="fixed bottom-4 left-4 h-8 px-3 rounded-full bg-zinc-900/10 backdrop-blur-sm flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-zinc-400 pointer-events-none sm:flex">
        <MonitorCheck className="w-3 h-3" />
        방향 전환 가능 (Portrait/Landscape)
      </div>
    </main>
  );
}
