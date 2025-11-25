import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-medium transition-all duration-300 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300",
    neon: "bg-transparent border border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
      {...props}
    />
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: { label: string, value: string }[] }> = ({ className = '', options, ...props }) => {
  return (
    <div className="relative">
        <select 
          className={`w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none transition-all ${className}`}
          {...props}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
            ▼
        </div>
    </div>
  );
};

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => {
  return (
    <label className={`block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ${className}`} {...props}>
      {children}
    </label>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
         {title && (
             <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                 <h3 className="text-xl font-bold text-white">{title}</h3>
                 <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                 </button>
             </div>
         )}
         <div className="overflow-auto custom-scrollbar flex-1">
             {children}
         </div>
      </div>
    </div>
  );
};