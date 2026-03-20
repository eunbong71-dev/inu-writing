"use client";

import { useEffect, useState, useCallback } from "react";
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
  UserPlus,
  RefreshCw
} from "lucide-react";

import { cn } from "@/lib/utils";
import { 
  fetchStudents, 
  updateStudent, 
  setWritingTopic as saveT, 
  fetchWritingTopic, 
  registerStudent,
  removeStudentAction,
  verifyAdminPassword,
  updateAdminPassword
} from "@/app/actions/studentActions";

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add form states
  const [newName, setNewName] = useState("");
  const [newId, setNewId] = useState("");
  const [newDivision, setNewDivision] = useState("");
  const [writingTopic, setWritingTopic] = useState("글쓰기 주제를 입력하세요");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const all = await fetchStudents();
      setStudents(all);
      const topic = await fetchWritingTopic();
      setWritingTopic(topic);
    } catch (e) {
      console.error("Refresh error", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Sync state and Periodically refresh for real-time monitoring
  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
      const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, refreshData]);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newId || !newDivision) return;
    
    const res = await registerStudent(newName, newId, newDivision);
    if (!res.success) {
      alert(res.message);
      return;
    }

    setNewName("");
    setNewId("");
    setNewDivision("");
    refreshData();
  };

  const addBulkStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.trim().split("\n");
    let addedCount = 0;
    let skipCount = 0;

    for (const line of lines) {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 3) {
        const [division, name, id] = parts;
        const res = await registerStudent(name, id, division);
        if (res.success) addedCount++;
        else skipCount++;
      }
    }

    setBulkInput("");
    alert(`${addedCount}명의 학생이 추가되었습니다.${skipCount > 0 ? ` (${skipCount}명 중복 제외)` : ""}`);
    refreshData();
  };

  const toggleLock = async (studentId: string, currentLock: boolean) => {
    await updateStudent(studentId, { isLocked: !currentLock });
    refreshData();
  };

  const resetSubmission = async (studentId: string) => {
    if (confirm("학생이 글을 다시 쓸 수 있도록 허용하시겠습니까? (이전 제출 기록이 초기화되지는 않지만, 다시 수정 및 제출이 가능해집니다.)")) {
      await updateStudent(studentId, { isSubmitted: false, isLocked: false });
      refreshData();
    }
  };

  const removeStudent = async (studentId: string) => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      await removeStudentAction(studentId);
      refreshData();
    }
  };

  const updateTopic = async (topic: string) => {
    setWritingTopic(topic);
    await saveT(topic);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyAdminPassword(password);
    if (success) {
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;
    if (confirm("비밀번호를 변경하시겠습니까?")) {
      await updateAdminPassword(newAdminPassword);
      setNewAdminPassword("");
      setIsChangingPassword(false);
      alert("비밀번호가 성공적으로 변경되었습니다.");
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
            <h1 className="text-3xl font-black">교수용 관리자</h1>
            <p className="text-zinc-500 font-medium font-sans">대시보드 접속을 위해 비밀번호를 입력하세요.</p>
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
              className="w-full h-14 rounded-2xl bg-accent text-white font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-accent/20"
            >
              로그인하기
            </button>
          </form>
          <p className="text-center text-xs text-zinc-400 font-bold">초기 비밀번호: admin123 (로그인 후 변경 가능)</p>
        </motion.div>
      </main>
    );
  }

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.id.includes(searchQuery) || s.division.includes(searchQuery)
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-full lg:w-80 h-auto lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-zinc-910 border-b lg:border-r border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 flex flex-col gap-8 shadow-sm overflow-y-auto">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <UserCog className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Admin Console</h2>
          </div>
          <button onClick={refreshData} className={cn("p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all", isRefreshing && "animate-spin")}>
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 space-y-8">
          {/* Topic Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              <BookType className="w-4 h-4" />
              글쓰기 주제 설정
            </div>
            <textarea 
              value={writingTopic}
              onChange={(e) => updateTopic(e.target.value)}
              placeholder="글쓰기 주제를 입력하세요..."
              className="w-full h-24 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-sm resize-none"
            />
          </div>

          {/* Add Student Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <Plus className="w-4 h-4" />
                학생 {isBulkMode ? "일괄" : "개별"} 추가
              </div>
              <button 
                onClick={() => setIsBulkMode(!isBulkMode)}
                className="text-[10px] font-black text-accent hover:underline"
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
                  className="w-full h-32 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-xs"
                />
                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-accent text-white font-black hover:shadow-lg active:scale-95 transition-all text-sm"
                >
                  명단 일괄 등록
                </button>
              </form>
            ) : (
              <form onSubmit={addStudent} className="space-y-3">
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="성명"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold"
                />
                <input 
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="학번"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold"
                />
                <input 
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  placeholder="분반 (예: 101)"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold"
                />
                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black hover:shadow-lg active:scale-95 transition-all text-sm"
                >
                  개별 추가하기
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={downloadAllAsTxt}
              className="w-full h-12 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <FileDown className="w-5 h-5" />
              전체 다운로드 (.txt)
            </button>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          {isChangingPassword ? (
            <form onSubmit={handleUpdatePassword} className="space-y-2">
              <input 
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-bold text-xs"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-accent text-white font-black text-[10px] hover:opacity-90 transition-all"
                >
                  변경 저장
                </button>
                <button 
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black text-[10px] hover:opacity-90 transition-all"
                >
                  취소
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-accent font-black px-2 transition-colors w-full text-left"
            >
              <Lock className="w-5 h-5" />
              비밀번호 변경
            </button>
          )}

          <button 
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 text-zinc-400 hover:text-accent font-black px-2 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <section className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">실시간 모니터링</h1>
              <p className="text-zinc-500 font-bold font-sans text-sm">학생들의 작성 현황과 부정행위를 실시간으로 감시합니다.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색 (이름, 학번, 분반)"
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-bold"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((s) => (
                <motion.div 
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group relative p-6 rounded-[32px] border transition-all duration-300 shadow-sm",
                    s.isLocked 
                      ? "bg-accent/5 border-accent/20 ring-4 ring-accent/5 shadow-xl shadow-accent/5" 
                      : s.isSubmitted
                        ? "bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-200 dark:border-emerald-800"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black">{s.name}</span>
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-lg",
                          s.isLocked ? "bg-accent animate-pulse" : s.isSubmitted ? "bg-emerald-500" : "bg-emerald-500 shadow-emerald-500/20"
                        )} />
                        {s.isSubmitted && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter">
                            제출완료
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                          {s.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                          분반 {s.division}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => downloadAsTxt(s)}
                        className="p-2 opacity-10 md:opacity-0 md:group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-emerald-500"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeStudent(s.id)}
                        className="p-2 opacity-10 md:opacity-0 md:group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-accent"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl min-h-[80px] max-h-[80px] overflow-hidden border mb-4",
                    s.isSubmitted ? "bg-white/50 dark:bg-zinc-900 border-emerald-100 dark:border-emerald-900" : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800"
                  )}>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 font-serif italic leading-relaxed">
                      {s.content || "아직 작성된 내용이 없습니다..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black px-1 mb-4">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Hash className="w-3 h-3" />
                      {s.content.length} characters
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full",
                      s.isLocked ? "text-accent bg-accent/10" : s.isSubmitted ? "text-emerald-600 bg-emerald-500/10" : "text-emerald-500 bg-emerald-500/10"
                    )}>
                      {s.isLocked ? <Lock className="w-3 h-3" /> : s.isSubmitted ? <CheckCircle2 className="w-3 h-3" /> : <MonitorCheck className="w-3 h-3" />}
                      {s.isLocked ? "잠김" : s.isSubmitted ? "제출" : "작성중"}
                    </div>
                  </div>

                  <button 
                    onClick={() => s.isSubmitted ? resetSubmission(s.id) : toggleLock(s.id, s.isLocked)}
                    className={cn(
                      "w-full h-11 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] text-sm",
                      s.isLocked 
                        ? "bg-accent text-white hover:bg-accent-dark" 
                        : s.isSubmitted
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    )}
                  >
                    {s.isLocked ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        해제 승인
                      </>
                    ) : s.isSubmitted ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        재작성 허용
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        강제 잠금
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredStudents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-zinc-100/30 dark:bg-zinc-900/30 rounded-[64px] border-2 border-dashed border-zinc-200 dark:border-zinc-800"
            >
              <Users className="w-16 h-16 text-zinc-300 mb-6" />
              <h3 className="text-xl font-black text-zinc-400 italic">등록된 학생이 없습니다.</h3>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
