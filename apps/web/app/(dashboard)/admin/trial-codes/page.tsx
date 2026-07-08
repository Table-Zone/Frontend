'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Plus, Trash2, Copy, Check, Pencil, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminFilterTabs } from '@/components/admin/AdminFilterTabs';

interface TrialCode {
  id: string;
  code: string;
  status: 'unused' | 'used';
  notes: string;
  usedBy: { name: string; email: string } | null;
  usedAt: string | null;
  createdAt: string;
}

export default function TrialCodesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [codes, setCodes] = useState<TrialCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('all');
  const [generateCount, setGenerateCount] = useState(5);
  const [generateNotes, setGenerateNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<TrialCode | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getTrialCodes({
        search: search || undefined,
        status: filter === 'all' ? undefined : filter,
        limit: 100,
      });
      setCodes(res.data.data.codes || []);
    } catch {
      showToast(isRTL ? 'فشل تحميل الأكواد' : 'Failed to load codes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchCodes();
  }, [filter, user]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCodes(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await adminAPI.generateTrialCodes(generateCount, generateNotes.trim() || undefined);
      showToast(isRTL ? 'تم إنشاء الأكواد' : 'Codes generated', 'success');
      setGenerateNotes('');
      fetchCodes();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const openNoteDialog = (code: TrialCode) => {
    setEditingCode(code);
    setNoteText(code.notes || '');
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!editingCode) return;
    setIsSavingNote(true);
    try {
      await adminAPI.updateTrialCodeNote(editingCode.id, noteText);
      showToast(isRTL ? 'تم حفظ الملاحظة' : 'Note saved', 'success');
      setNoteDialogOpen(false);
      fetchCodes();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: isRTL ? 'حذف الكود' : 'Delete Code',
      message: isRTL ? 'هل أنت متأكد من حذف هذا الكود؟' : 'Are you sure you want to delete this code?',
      confirmLabel: isRTL ? 'حذف' : 'Delete',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteTrialCode(id);
      showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
      fetchCodes();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filterLabels = {
    all: isRTL ? 'الكل' : 'All',
    unused: isRTL ? 'غير مستخدم' : 'Unused',
    used: isRTL ? 'مستخدم' : 'Used',
  };

  return (
    <div>
      <AdminPageHeader
        title={isRTL ? 'أكواد التجربة المجانية' : 'Trial Codes'}
        icon={Ticket}
        description={isRTL ? 'إنشاء وإدارة أكواد التجربة لمدة 7 أيام' : 'Create and manage 7-day trial codes'}
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              type="number"
              min={1}
              max={100}
              value={generateCount}
              onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
              className="w-20 h-10"
              title={isRTL ? 'عدد الأكواد' : 'Number of codes'}
            />
            <Input
              value={generateNotes}
              onChange={(e) => setGenerateNotes(e.target.value)}
              placeholder={isRTL ? 'ملاحظة (مثال: أعطيته لأحمد)' : 'Note (e.g. given to Ahmed)'}
              className="h-10 w-full sm:w-56"
            />
            <Button onClick={handleGenerate} disabled={isGenerating} className="shrink-0">
              <Plus className="w-4 h-4 me-2" />
              {isRTL ? 'إنشاء أكواد' : 'Generate'}
            </Button>
          </div>
        }
      />

      <p className="text-sm text-muted-foreground mb-4 -mt-4">
        {isRTL
          ? 'يمكنك إضافة ملاحظة عند الإنشاء (تُطبّق على كل الأكواد)، أو تعديل ملاحظة كل كود لاحقاً لتوضيح لمن أُعطي.'
          : 'Add a note when generating (applies to all codes), or edit each code later to record who it was given to.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <AdminFilterTabs
          filters={['all', 'unused', 'used'] as const}
          active={filter}
          onChange={setFilter}
          labels={filterLabels}
        />
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={isRTL ? 'بحث بالكود أو الملاحظة...' : 'Search by code or note...'}
          isRTL={isRTL}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border">
          {isRTL ? 'لا توجد أكواد' : 'No codes found'}
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-tz-cream-dark p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <code className="font-mono font-bold text-lg text-tz-primary">{code.code}</code>
                    <Badge variant={code.status === 'unused' ? 'free' : 'secondary'}>
                      {code.status === 'unused' ? (isRTL ? 'غير مستخدم' : 'Unused') : (isRTL ? 'مستخدم' : 'Used')}
                    </Badge>
                  </div>

                  {code.notes ? (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-tz-cream/50 rounded-xl px-3 py-2 mb-2">
                      <StickyNote className="w-4 h-4 shrink-0 mt-0.5 text-tz-primary" />
                      <span>{code.notes}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-2">
                      {isRTL ? 'لا توجد ملاحظة' : 'No note'}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {code.usedBy && (
                      <span>{code.usedBy.name} ({code.usedBy.email})</span>
                    )}
                    <span>{new Date(code.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openNoteDialog(code)} title={isRTL ? 'تعديل الملاحظة' : 'Edit note'}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyCode(code.code, code.id)}>
                    {copiedId === code.id ? <Check className="w-4 h-4 text-tz-green" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  {code.status === 'unused' && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'ملاحظة الكود' : 'Code Note'}
              {editingCode && (
                <span className="block text-sm font-normal text-muted-foreground mt-1 font-mono">
                  {editingCode.code}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs text-muted-foreground mb-2">
              {isRTL
                ? 'اكتب لمن أُعطي هذا الكود أو أي تفاصيل تساعدك لاحقاً'
                : 'Record who this code was given to or any helpful details'}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={isRTL ? 'مثال: أعطيته لمطعم النخيل - أحمد' : 'e.g. Given to Al Nakheel Restaurant - Ahmed'}
              className="w-full min-h-[100px] rounded-xl border border-tz-cream-dark px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-tz-primary/30"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-end">{noteText.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveNote} disabled={isSavingNote}>
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
