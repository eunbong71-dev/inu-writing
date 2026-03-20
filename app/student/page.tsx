"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lock, LogOut, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Load student on mount
  useEffect(() => {
    const saved = localStorage.getItem("currentStudent");
    if (saved) {
      setStudent(JSON.parse(saved));
    }

    const savedTopic = localStorage.getItem("writingTopic");
    if (savedTopic) {
      setWritingTopic(savedTopic);
    }

    // Sync state from other windows (Admin)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "students" && student) {
        const students: Student[] = JSON.parse(e.newValue || "[]");
        const updated = students.find(s => s.id === student.id);
        if (updated && (updated.isLocked !== student.isLocked || updated.isSubmitted !== student.isSubmitted)) {
          setStudent(updated);
          localStorage.setItem("currentStudent", JSON.stringify(updated));
        }
      }
      if (e.key === "writingTopic") {
        setWritingTopic(e.newValue || "자율 글쓰기 영역");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [student?.id, student?.isLocked, student?.isSubmitted]);

  // Anti-cheating lock
  useEffect(() => {
    if (!student || student.isLocked || student.isSubmitted) return;

    const lockMe = () => {
      const current = { ...student, isLocked: true };
      setStudent(current);
      updateGlobalStatus(current);
    };

    window.addEventListener("blur", lockMe);
    return () => window.removeEventListener("blur", lockMe);
  }, [student]);

  const updateGlobalStatus = (updatedS: Student) => {
    localStorage.setItem("currentStudent", JSON.stringify(updatedS));
    const allStudents: Student[] = JSON.parse(localStorage.getItem("students") || "[]");
    const newAll = allStudents.map(s => s.id === updatedS.id ? updatedS : s);
    localStorage.setItem("students", JSON.stringify(newAll));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !idInput) {
      setError("성명과 학번을 모두 입력해주세요.");
      return;
    }

    const allStudents: Student[] = JSON.parse(localStorage.getItem("students") || "[]");
    const found = allStudents.find(s => s.name === nameInput && s.id === idInput);

    if (found) {
      setStudent(found);
      localStorage.setItem("currentStudent", JSON.stringify(found));
      setError("");
    } else {
      setError("등록되지 않은 학생입니다. 관리자에게 문의하세요.");
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
    updateGlobalStatus(updated);
  };

  const handleFinalSubmit = () => {
    if (!student) return;
    if (confirm("최종 제출하시겠습니까? 제출 후에는 수정이 불가능합니다.")) {
      const updated = { ...student, isSubmitted: true };
      setStudent(updated);
      updateGlobalStatus(updated);
    }
  };

  if (!student) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">학생 로그인</h1>
            <p className="text-zinc-500">지정된 단말기에서 시험을 시작하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium px-1">성명</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="홍길동"
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium px-1">학번</label>
              <input 
                type="text" 
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="20240001"
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            {error && (
              <p className="text-accent text-sm font-medium flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
            <button 
              type="submit"
              className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              로그인 및 시작
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="font-bold text-lg">{student.name}</span>
            <span className="ml-2 text-sm text-zinc-500">{student.id} ({student.division})</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-500 hover:text-accent hover:bg-accent/5 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </header>

      {/* Editor Area */}
      <section className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-bold">{writingTopic}</h2>
            <div className="text-sm font-medium text-zinc-400">
              글자 수: <span className="text-primary font-bold">{student.content.length}</span> / 2000
            </div>
          </div>
          
          <div className="flex-1 relative group">
            <textarea 
              value={student.content}
              onChange={handleContentChange}
              disabled={student.isLocked || student.isSubmitted}
              placeholder={student.isSubmitted ? "제출이 완료되었습니다. 수정할 수 없습니다." : "여기에 글을 작성하세요. 다른 창이나 탭으로 이동 시 글쓰기가 잠깁니다."}
              className={cn(
                "w-full h-full min-h-[500px] p-10 rounded-3xl border text-xl leading-relaxed resize-none transition-all duration-300",
                "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-serif",
                student.isLocked 
                  ? "opacity-50 blur-[2px] cursor-not-allowed grayscale" 
                  : student.isSubmitted 
                    ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 font-serif shadow-inner" 
                    : "focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-xl"
              )}
            />
            
            {/* Lock Overlay */}
            <AnimatePresence>
              {student.isLocked && !student.isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-2xl max-w-sm space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2 animate-pulse">
                      <Lock className="w-10 h-10 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-accent">접근 제한됨</h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        비정상적인 활동(창 이동)이 감지되었습니다. <br />
                        교수의 승인이 있어야 해제됩니다.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-center gap-2 text-sm font-semibold text-zinc-400">
                      <div className="w-2 h-2 rounded-full bg-zinc-300 animate-ping" />
                      잠금 해제 대기 중...
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submitted Overlay (Subtle) */}
            <AnimatePresence>
              {student.isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-x-0 top-0 mt-4 flex justify-center pointer-events-none"
                >
                  <div className="bg-emerald-500/90 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <Send className="w-4 h-4" />
                    제출 완료 - 수정 불가능
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-end gap-3 px-2">
            {!student.isSubmitted ? (
              <button 
                onClick={handleFinalSubmit}
                disabled={student.isLocked}
                className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                최종 제출하기
              </button>
            ) : (
              <div className="flex items-center gap-2 px-8 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold opacity-60">
                <Send className="w-5 h-5" />
                최종 제출 완료
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
