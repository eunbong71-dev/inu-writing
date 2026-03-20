"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCog, 
  Users, 
  Plus, 
  Lock, 
  Unlock, 
  Trash2, 
  Search, 
  LogOut, 
  AlertTriangle,
  MonitorCheck,
  CheckCircle2,
  XCircle,
  Hash,
  Download,
  FileText,
  FileDown,
  BookType,
  UserPlus
} from "lucide-react";

import { cn } from "@/lib/utils";

type Student = {
  name: string;
  id: string;
  division: string;
  isLocked: boolean;
  content: string;
  isSubmitted: boolean;
};

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Add form states
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [writingTopic, setWritingTopic] = useState("글쓰기 주제를 입력하세요");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  // Sync state
  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }

    const savedTopic = localStorage.getItem("writingTopic");
    if (savedTopic) {
      setWritingTopic(savedTopic);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "students") {
        setStudents(JSON.parse(e.newValue || "[]"));
      }
      if (e.key === "writingTopic") {
        setWritingTopic(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveStudents = (updated: Student[]) => {
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
  };

  const saveTopic = (topic: string) => {
    setWritingTopic(topic);
    localStorage.setItem("writingTopic", topic);
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newId || !newDivision) return;
    
    if (students.find(s => s.id === newId)) {
      alert("이미 존재하는 학번입니다.");
      return;
    }

    const newStudent: Student = {
      name: newName,
      id: newId,
      division: newDivision,
      isLocked: false,
      content: "",
      isSubmitted: false
    };

    saveStudents([...students, newStudent]);
    setNewName("");
    setNewId("");
    setNewDivision("");
  };

  const addBulkStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.trim().split("\n");
    const newStudents: Student[] = [];
    const existingIds = new Set(students.map(s => s.id));
    let skipCount = 0;

    lines.forEach(line => {
      // Split by comma, tab, or space
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 3) {
        const [division, name, id] = parts;
        if (!existingIds.has(id)) {
          newStudents.push({
            division,
            name,
            id,
            isLocked: false,
            content: "",
            isSubmitted: false
          });
          existingIds.add(id);
        } else {
          skipCount++;
        }
      }
    });

    if (newStudents.length > 0) {
      saveStudents([...students, ...newStudents]);
      setBulkInput("");
      alert(`${newStudents.length}명의 학생이 추가되었습니다.${skipCount > 0 ? ` (${skipCount}명 중복 제외)` : ""}`);
    } else if (skipCount > 0) {
      alert("모든 학생이 이미 등록되어 있습니다.");
    } else {
      alert("올바른 형식으로 입력해주세요. (분반, 이름, 학번)");
    }
  };

  const toggleLock = (studentId: string) => {
    const updated = students.map(s => 
      s.id === studentId ? { ...s, isLocked: !s.isLocked } : s
    );
    saveStudents(updated);
  };

  const removeStudent = (studentId: string) => {
    if (confirm("삭제하시겠습니까?")) {
      saveStudents(students.filter(s => s.id !== studentId));
    }
  };

  const downloadAsTxt = (student: Student) => {
    const filename = `${student.division}_${student.id}_${student.name}.txt`;
    const element = document.createElement("a");
    const file = new Blob([student.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAllAsTxt = () => {
    if (students.length === 0) return;
    students.forEach(s => {
      if (s.content) downloadAsTxt(s);
    });
  };



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-10 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">교수용 관리자</h1>
            <p className="text-zinc-500">대시보드 접속을 위해 비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all text-center text-xl tracking-widest font-bold"
            />
            <button 
              type="submit"
              className="w-full h-14 rounded-2xl bg-accent text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              접속하기
            </button>
          </form>
          <p className="text-center text-xs text-zinc-400">초기 비밀번호: admin123</p>
        </motion.div>
      </main>
    );
  }

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.id.includes(searchQuery) || s.division.includes(searchQuery)
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-80 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <UserCog className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
          {/* Topic Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-sm font-bold text-zinc-400 uppercase tracking-widest">
              <BookType className="w-4 h-4" />
              글쓰기 주제 설정
            </div>
            <div className="space-y-3">
              <textarea 
                value={writingTopic}
                onChange={(e) => saveTopic(e.target.value)}
                placeholder="글쓰기 주제를 입력하세요..."
                className="w-full h-24 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm resize-none"
              />
            </div>
          </div>

          {/* Add Student Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest">
                <Plus className="w-4 h-4" />
                학생 {isBulkMode ? "일괄" : "개별"} 추가
              </div>
              <button 
                onClick={() => setIsBulkMode(!isBulkMode)}
                className="text-[10px] font-bold text-accent hover:underline"
              >
                {isBulkMode ? "개별 입력" : "일괄 입력"}
              </button>
            </div>

            {isBulkMode ? (
              <form onSubmit={addBulkStudents} className="space-y-3">
                <textarea 
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="분반, 이름, 학번&#10;(줄바꿈으로 구분)"
                  className="w-full h-40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
                />
                <p className="text-[10px] text-zinc-400 px-2 leading-tight">
                  * 쉼표(,)나 탭으로 구분하여 한 줄에 한 명씩 입력하세요.<br/>
                  * 예: 101, 홍길동, 20240001
                </p>
                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-accent text-white font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  일괄 추가하기
                </button>
              </form>
            ) : (
              <form onSubmit={addStudent} className="space-y-3">
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="성명"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                />
                <input 
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="학번"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                />
                <input 
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  placeholder="분반 (예: 101)"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                />
                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  추가하기
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-2 px-2 text-sm font-bold text-zinc-400 uppercase tracking-widest">
              <MonitorCheck className="w-4 h-4" />
              현황 요약
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800">
                <div className="text-2xl font-black text-primary">{students.length}</div>
                <div className="text-xs font-bold opacity-50">총학생</div>
              </div>
              <div className="p-4 rounded-2xl bg-accent/10">
                <div className="text-2xl font-black text-accent">{students.filter(s => s.isLocked).length}</div>
                <div className="text-xs font-bold text-accent opacity-80">잠금됨</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10">
                <div className="text-2xl font-black text-emerald-500">{students.filter(s => s.isSubmitted).length}</div>
                <div className="text-xs font-bold text-emerald-500 opacity-80">제출함</div>
              </div>
            </div>

            <button 
              onClick={downloadAllAsTxt}
              className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileDown className="w-5 h-5" />
              전체 다운로드 (.txt)
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-2 text-zinc-400 hover:text-accent font-bold px-2 transition-colors mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </aside>

      {/* Content Area */}
      <section className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">학생 실시간 모니터링</h1>
              <p className="text-zinc-500 font-medium font-sans">실시간으로 학업 정직도를 확인하고 제재를 관리합니다.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색 (이름, 학번, 분반)"
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((s) => (
                <motion.div 
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group relative p-6 rounded-3xl border transition-all duration-300 shadow-sm",
                    s.isLocked 
                      ? "bg-accent/5 border-accent/20 ring-4 ring-accent/5" 
                      : s.isSubmitted
                        ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{s.name}</span>
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                          s.isLocked ? "bg-accent animate-pulse" : s.isSubmitted ? "bg-emerald-500" : "bg-emerald-500 shadow-emerald-500/20"
                        )} />
                        {s.isSubmitted && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter">
                            제출완료
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                          {s.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                          분반 {s.division}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => downloadAsTxt(s)}
                        title="텍스트 파일로 저장"
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-emerald-500"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeStudent(s.id)}
                        title="학생 삭제"
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-accent"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={cn(
                      "p-4 rounded-2xl min-h-[100px] max-h-[100px] overflow-hidden border",
                      s.isSubmitted ? "bg-white/50 dark:bg-zinc-900 border-emerald-100 dark:border-emerald-900" : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800"
                    )}>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-4 font-serif italic leading-relaxed">
                        {s.content || "아직 작성된 내용이 없습니다..."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold px-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Hash className="w-3.5 h-3.5" />
                        {s.content.length} characters
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px]",
                        s.isLocked ? "text-accent bg-accent/10" : s.isSubmitted ? "text-emerald-600 bg-emerald-500/10" : "text-emerald-500 bg-emerald-500/10"
                      )}>
                        {s.isLocked ? <Lock className="w-3.5 h-3.5" /> : s.isSubmitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <MonitorCheck className="w-3.5 h-3.5" />}
                        {s.isLocked ? "잠김" : s.isSubmitted ? "제출됨" : "작성중"}
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleLock(s.id)}
                      disabled={s.isSubmitted}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]",
                        s.isLocked 
                          ? "bg-accent text-white hover:bg-accent-dark shadow-accent/20" 
                          : s.isSubmitted
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                      )}
                    >
                      {s.isLocked ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          잠금 해제
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {s.isSubmitted ? "제출 완료됨" : "강제 잠금"}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredStudents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800"
            >
              <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-400 italic">등록된 학생이 없습니다.</h3>
              <p className="text-zinc-500">왼쪽의 추가 폼을 사용하여 학생을 등록하거나 검색어를 확인하세요.</p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
