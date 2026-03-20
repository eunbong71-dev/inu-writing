"use client";

import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground">
            INU Writing <span className="text-primary italic">Guardian</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            정직한 글쓰기 문화를 위한 스마트 실시간 모니터링 플랫폼
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {/* Student Entrance */}
          <Link href="/student" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">학생(Student)</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                성명과 학번을 입력하여 접속하세요.<br />
                시험 중 다른 창 이동 시 글쓰기가 잠깁니다.
              </p>
            </motion.div>
          </Link>

          {/* Admin Entrance */}
          <Link href="/admin" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:border-accent/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <UserCog className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">관리자(Admin)</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                교수용 관리 대시보드입니다.<br />
                학생 등록 및 실시간 잠금 해제가 가능합니다.
              </p>
            </motion.div>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
          <ShieldCheck className="w-4 h-4" />
          <span>보안 프로토콜 활성화됨</span>
        </div>
      </motion.div>
    </main>
  );
}
