import React from 'react';
import { Link } from 'react-router-dom';

export function BrandLogo({ to = '/', dark = false, subtitle = '' }) {
  return (
    <Link to={to} className="inline-flex flex-col group focus:outline-none">
      <span
        className={`font-display font-extrabold tracking-tight text-2xl leading-none ${
          dark ? 'text-[#11183B]' : 'text-white'
        }`}
      >
        FoundIt<span className={dark ? 'text-[#303BFA]' : 'text-[#DDE2FF]'}>.</span>
      </span>
      {subtitle && (
        <span
          className={`text-[11px] font-medium mt-1 ${
            dark ? 'text-slate-500' : 'text-white/75'
          }`}
        >
          {subtitle}
        </span>
      )}
    </Link>
  );
}
