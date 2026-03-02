/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Search, 
  Zap, 
  MapPin, 
  Users, 
  Target, 
  Copy, 
  Download, 
  RefreshCw,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the keyword generation
interface KeywordResult {
  keyword: string;
  strategy: string;
  effect: string;
}

export default function App() {
  const [mainKeyword, setMainKeyword] = useState('');
  const [mainKeyword2, setMainKeyword2] = useState('');
  const [region, setRegion] = useState('');
  const [usp, setUsp] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [count, setCount] = useState(30);
  const [isAutoCount, setIsAutoCount] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [copied, setCopied] = useState(false);

  const generateKeywords = async () => {
    if (!mainKeyword) return;
    
    setLoading(true);
    setResults([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const countPrompt = isAutoCount 
        ? "키워드의 시장 규모와 확장성을 고려하여 가장 적합한 개수(보통 20~40개 사이)의" 
        : `${count}개의`;

      const mainKeywordsText = mainKeyword2 ? `'${mainKeyword}'와 '${mainKeyword2}'` : `'${mainKeyword}'`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `당신은 네이버 파워링크 및 구글 검색광고 최적화 전문가입니다. 
제공된 googleSearch 도구를 활용하여 실시간 검색 트렌드와 예상 검색량을 분석하고, 다음 정보를 바탕으로 검색량이 높은 순서대로 고효율 조합 키워드를 ${countPrompt} 생성해주세요.

[입력 정보]
1. 메인 키워드 1: ${mainKeyword}
${mainKeyword2 ? `2. 메인 키워드 2: ${mainKeyword2}` : ''}
${mainKeyword2 ? '3' : '2'}. 주요 타겟 지역: ${region || '전국'}
${mainKeyword2 ? '4' : '3'}. 핵심 서비스 강점(USP): ${usp || '전문성, 신뢰성'}
${mainKeyword2 ? '5' : '4'}. 주요 타겟 고객: ${targetAudience || '일반 소비자'}

[작업 원칙]
1. **데이터 기반 랭킹: googleSearch 도구를 통해 현재 시점의 네이버와 구글 검색 트렌드를 정밀하게 파악하세요. 검색량이 가장 높을 것으로 판단되는 키워드부터 내림차순으로 정렬하여 출력해야 합니다.**
2. 메인 키워드 포함: 모든 결과물에 ${mainKeywordsText} 중 적어도 하나 이상이 반드시 포함되어야 함.
3. 4가지 전략 조합: 의도형, 로컬형, 타겟형, USP형을 적절히 섞어서 생성.
4. 자연스러운 한국어 어순 유지 및 중복 제거.
5. **특수문자 금지: 키워드 내에 콜론(:), 세미콜론(;), 슬래시(/) 등 어떠한 특수문자도 포함하지 마세요. 오직 한글, 영문, 숫자, 공백만 허용합니다.**

결과는 반드시 JSON 배열 형식으로만 출력해주세요. 각 객체는 'keyword', 'strategy', 'effect' 속성을 가져야 합니다.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING, description: "조합된 키워드" },
                strategy: { type: Type.STRING, description: "전략 유형" },
                effect: { type: Type.STRING, description: "기대 효과 설명" }
              },
              required: ["keyword", "strategy", "effect"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setResults(data);
    } catch (error) {
      console.error("Keyword generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = results.map(r => r.keyword).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    const header = "조합 키워드,전략 유형,기대 효과\n";
    const rows = results.map(r => `"${r.keyword}","${r.strategy}","${r.effect}"`).join('\n');
    const blob = new Blob(["\ufeff" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `keywords_${mainKeyword}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Zap className="text-black w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">혁신 키워드 조합 AI</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Keyword Strategy Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">키워드 설정</h2>
              <p className="text-white/50 text-sm">광고 성과를 극대화할 핵심 정보를 입력하세요.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                  <Target className="w-3 h-3" /> 메인 키워드 1
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="예: 포장이사"
                    value={mainKeyword}
                    onChange={(e) => setMainKeyword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                    <Target className="w-3 h-3" /> 메인 키워드 2 (선택)
                  </label>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="예: 이삿짐센터"
                    value={mainKeyword2}
                    onChange={(e) => setMainKeyword2(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                  <p className="mt-1.5 text-[10px] text-white/30 font-medium">* 메인 키워드가 두개일경우 작성합니다.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> 주요 타겟 지역
                </label>
                <input 
                  type="text"
                  placeholder="예: 서울 전체, 강남구"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                  <Zap className="w-3 h-3" /> 서비스 강점 (USP)
                </label>
                <input 
                  type="text"
                  placeholder="예: 당일 가능, 전국 최저가"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                  <Users className="w-3 h-3" /> 타겟 고객
                </label>
                <input 
                  type="text"
                  placeholder="예: 1인 가구, 직장인"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2">
                    <RefreshCw className="w-3 h-3" /> 생성 개수
                  </label>
                  <button 
                    onClick={() => setIsAutoCount(!isAutoCount)}
                    className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${isAutoCount ? 'bg-white text-black' : 'bg-white/10 text-white/40'}`}
                  >
                    {isAutoCount ? 'AI 추천 모드' : '수동 설정 모드'}
                  </button>
                </div>
                
                {isAutoCount ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 italic">
                    AI가 키워드의 성격과 시장 규모를 분석하여 최적의 조합 개수를 자동으로 결정합니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-white/40">
                      <span>MIN 10</span>
                      <span className="text-white font-bold">{count} KEYWORDS</span>
                      <span>MAX 50</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full accent-white h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={generateKeywords}
              disabled={loading || !mainKeyword}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  조합 키워드 생성하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </section>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-white/60" />
              전략적 조합 원칙
            </h3>
            <ul className="space-y-3 text-xs text-white/50 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-white font-bold">01</span>
                <span>의도형: 구매 직전 단계의 단어(가격, 추천, 후기) 조합</span>
              </li>
              <li className="flex gap-2">
                <span className="text-white font-bold">02</span>
                <span>로컬형: 주요 지역명 또는 위치 관련 단어 조합</span>
              </li>
              <li className="flex gap-2">
                <span className="text-white font-bold">03</span>
                <span>타겟형: 특정 대상(직장인, 주부 등) 지정</span>
              </li>
              <li className="flex gap-2">
                <span className="text-white font-bold">04</span>
                <span>USP형: 서비스 강점(당일, 최저가, 전문) 강조</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          <div className="bg-white/5 rounded-[32px] border border-white/10 min-h-[600px] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">생성 결과</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
                  {results.length > 0 ? `${results.length} Keywords Optimized` : 'Waiting for Input'}
                </p>
              </div>
              
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors relative group"
                    title="복사하기"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white/60" />}
                    <AnimatePresence>
                      {copied && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-500 text-white px-2 py-1 rounded font-bold whitespace-nowrap"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button 
                    onClick={downloadCsv}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/60"
                    title="CSV 다운로드"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center p-12 space-y-6 text-center"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                      <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white fill-current animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">AI가 최적의 키워드를 조합하고 있습니다</p>
                      <p className="text-white/40 text-sm">네이버 검색 트렌드와 광고 효율을 분석 중입니다...</p>
                    </div>
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="divide-y divide-white/5"
                  >
                    <div className="grid grid-cols-12 px-8 py-4 bg-white/[0.01] text-[10px] uppercase tracking-widest font-bold text-white/30">
                      <div className="col-span-5">조합 키워드</div>
                      <div className="col-span-3">전략 유형</div>
                      <div className="col-span-4">기대 효과</div>
                    </div>
                    {results.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="grid grid-cols-12 px-8 py-5 hover:bg-white/[0.03] transition-colors group cursor-default"
                      >
                        <div className="col-span-5 font-medium text-white group-hover:text-white transition-colors">
                          {item.keyword}
                        </div>
                        <div className="col-span-3">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold uppercase tracking-tighter">
                            {item.strategy}
                          </span>
                        </div>
                        <div className="col-span-4 text-sm text-white/40 leading-snug group-hover:text-white/60 transition-colors">
                          {item.effect}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 opacity-20 grayscale">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium">생성된 키워드가 없습니다</p>
                      <p className="text-sm">왼쪽 폼에 정보를 입력하고 생성 버튼을 눌러주세요.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tighter uppercase">Innovation Keyword AI</span>
          </div>
          <p className="text-xs font-medium">© 2024 NEXTIN AI Lab. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
