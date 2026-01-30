'use client'

import React, { useState } from 'react';
import { Trophy, Download } from 'lucide-react';

export default function Page() {
  const [checkedItems, setCheckedItems] = useState<{num: number, date: string}[]>([]);

  const toggleCheck = (num: number) => {
    const isChecked = checkedItems.find(item => item.num === num);
    if (isChecked) {
      setCheckedItems(checkedItems.filter(i => i.num !== num));
    } else {
      const today = new Date().toLocaleDateString('ja-JP');
      setCheckedItems([...checkedItems, { num, date: today }]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-600">
        <Trophy /> 100マス・チャレンジ
      </h1>
      
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-white p-4 rounded-xl shadow">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
          const check = checkedItems.find(item => item.num === num);
          return (
            <button
              key={num}
              onClick={() => toggleCheck(num)}
              className={`aspect-square border rounded text-[10px] flex flex-col items-center justify-center ${
                check ? 'bg-blue-500 text-white' : 'bg-white text-gray-400'
              }`}
            >
              <span>{num}</span>
              {check && <span className="text-[8px]">{check.date.slice(5)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
