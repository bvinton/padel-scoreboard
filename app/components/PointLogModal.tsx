import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { MessageSquareText } from "lucide-react";

interface PointLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyLog: { id: number; time: string; msg: string }[];
}

export default function PointLogModal({ isOpen, onClose, historyLog }: PointLogModalProps) {
  const { language } = useMatchStore();
  const t = dict[language] || dict.en;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] bg-black/95 flex flex-col p-4 md:p-10" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 flex-1 rounded-3xl flex flex-col overflow-hidden max-w-4xl w-full mx-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-950">
          <h2 className="text-xl md:text-3xl font-black text-slate-300 uppercase italic flex items-center gap-3">
            <MessageSquareText className="text-slate-500" /> {language === 'es' ? 'Registro de Puntos' : 'Point Log'}
          </h2>
          <button onClick={onClose} className="text-slate-400 font-bold uppercase active:scale-95 transition-transform">{t.close}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {historyLog.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 font-bold uppercase">{language === 'es' ? 'No hay eventos' : 'No events logged'}</div>
          ) : (
            historyLog.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-500 font-mono text-sm">{log.time}</span>
                <span className="text-slate-300 font-medium">{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}