'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // ステップ2で作ったファイルを読み込む
import confetti from 'canvas-confetti';
import { Download, Trophy, Users } from 'lucide-react';

export default function ChallengeApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [checkedItems, setCheckedItems] = useState<{num: number, date: string}[]>([]);
  const [stats, setStats] = useState({ user_count: 0, total_checks: 0 });

  // 1. 起動時にログイン状態とデータをチェック
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUserData(user.id);
      }
      fetchGlobalStats();
    };
    init();
  }, []);

  // 2. ユーザーのチェックデータをDBから持ってくる
  const fetchUserData = async (uid: string) => {
    const { data } = await supabase
      .from('check_ins')
      .select('box_number, created_at')
      .eq('user_id', uid);
    
    if (data) {
      setCheckedItems(data.map(d => ({
        num: d.box_number,
        date: new Date(d.created_at).toLocaleDateString('ja-JP')
      })));
    }
  };

  // 3. マスをクリックした時にDBへ保存/削除
  const toggleCheck = async (num: number) => {
    if (!userId) return alert("ログインが必要です");

    const isChecked = checkedItems.find(item => item.num === num);

    if (isChecked) {
      // 削除
      await supabase.from('check_ins').delete().eq('user_id', userId).eq('box_number', num);
      setCheckedItems(checkedItems.filter(i => i.num !== num));
    } else {
      // 保存
      const { error } = await supabase.from('check_ins').insert([
        { user_id: userId, box_number: num }
      ]);
      if (!error) {
        const today = new Date().toLocaleDateString('ja-JP');
        const newChecks = [...checkedItems, { num, date: today }];
        setCheckedItems(newChecks);
        if (newChecks.length === 100) confetti({ particleCount: 150 });
      }
    }
    fetchGlobalStats();
  };

  // 全体の統計を取得
  const fetchGlobalStats = async () => {
    const { data } = await supabase.from('global_stats').select('*');
    if (data && data[0]) {
      // 合計人数などを計算してセット
      const totalUsers = data.reduce((acc, cur) => acc + cur.user_count, 0);
      setStats({ user_count: totalUsers, total_checks: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-4xl mx-auto">
      {/* 画面部分は以前のコードと同様、データ反映部分を {checkedItems} などに置き換え */}
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Trophy /> 100マス・チャレンジ</h1>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-sm text-gray-500 mb-2">所属と名前を保存して開始</p>
        <div className="flex gap-2">
          <input className="border p-2 flex-1" placeholder="お名前" value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-2 flex-1" placeholder="所属" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {/* 保存処理 */}}>保存</button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 bg-white p-2 rounded shadow">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
          const check = checkedItems.find(item => item.num === num);
          return (
            <button key={num} onClick={() => toggleCheck(num)} className={`aspect-square border text-[10px] ${check ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              {num}<br/>{check?.date.slice(5)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
