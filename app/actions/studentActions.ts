"use server";

import { 
  getStudents, 
  saveStudents, 
  getTopic, 
  saveTopic as saveT, 
  getAdminPassword, 
  saveAdminPassword 
} from "@/lib/data-store";

export async function fetchStudents() {
  return await getStudents();
}

export async function registerStudent(name: string, id: string, division: string) {
  const all = await getStudents();
  if (all.find(s => s.id === id)) {
    return { success: false, message: "이미 등록된 학번입니다." };
  }
  const newS = { name, id, division, isLocked: false, content: "", isSubmitted: false };
  await saveStudents([...all, newS]);
  return { success: true, student: newS };
}

export async function updateStudent(id: string, updates: any) {
  const all = await getStudents();
  const updated = all.map(s => s.id === id ? { ...s, ...updates } : s);
  await saveStudents(updated);
  return { success: true };
}

export async function fetchWritingTopic() {
  return await getTopic();
}

export async function setWritingTopic(topic: string) {
  await saveT(topic);
  return { success: true };
}

export async function removeStudentAction(id: string) {
  const all = await getStudents();
  const filtered = all.filter(s => s.id !== id);
  await saveStudents(filtered);
  return { success: true };
}

export async function verifyAdminPassword(password: string) {
  const actual = await getAdminPassword();
  return actual.trim() === password.trim();
}

export async function updateAdminPassword(newPassword: string) {
  await saveAdminPassword(newPassword.trim());
  return { success: true };
}
