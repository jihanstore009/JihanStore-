import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  MousePointer,
  Eye,
  Percent,
  Award,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Advertisement, AdPosition } from '../types';

interface AdPerformanceDashboardProps {
  ads: Advertisement[];
  onPreviewAd?: (ad: Advertisement) => void;
  onEditAd?: (ad: Advertisement) => void;
}

const POSITION_COLORS: Record<AdPosition, string> = {
  homepage: '#2563eb', // blue
  product_list: '#10b981', // emerald
  category_page: '#8b5cf6', // purple
  product_details: '#f59e0b' // amber
};

const POSITION_NAMES: Record<AdPosition, string> = {
  homepage: 'হোমপেজ ব্যানার',
  product_list: 'প্রোডাক্ট ক্যাটালগ',
  category_page: 'ক্যাটাগরি পেজ',
  product_details: 'প্রোডাক্ট বিস্তারিত'
};

export const AdPerformanceDashboard: React.FC<AdPerformanceDashboardProps> = ({
  ads,
  onPreviewAd,
  onEditAd
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'ctr' | 'title'>('clicks');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartMetric, setChartMetric] = useState<'both' | 'clicks' | 'ctr'>('both');

  // Compute calculated metrics per ad
  const processedAds = useMemo(() => {
    return ads.map((ad) => {
      const clicks = Number(ad.clicks ?? ad.clicksCount) || 0;
      const impressions = Number(ad.impressions ?? ad.impressionsCount) || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      return {
        ...ad,
        clicks,
        impressions,
        ctr: Number(ctr.toFixed(2)),
        shortTitle: ad.title.length > 18 ? ad.title.substring(0, 18) + '...' : ad.title
      };
    });
  }, [ads]);

  // Overall KPIs
  const overallStats = useMemo(() => {
    const totalClicks = processedAds.reduce((acc, a) => acc + a.clicks, 0);
    const totalImpressions = processedAds.reduce((acc, a) => acc + a.impressions, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Top ad by CTR (among those with at least 1 impression or highest clicks)
    const sortedByCtr = [...processedAds].sort((a, b) => {
      if (b.ctr !== a.ctr) return b.ctr - a.ctr;
      return b.clicks - a.clicks;
    });
    const topByCtr = sortedByCtr.length > 0 && sortedByCtr[0].clicks > 0 ? sortedByCtr[0] : null;

    // Top ad by clicks
    const sortedByClicks = [...processedAds].sort((a, b) => b.clicks - a.clicks);
    const topByClicks = sortedByClicks.length > 0 && sortedByClicks[0].clicks > 0 ? sortedByClicks[0] : null;

    return {
      totalClicks,
      totalImpressions,
      avgCtr: Number(avgCtr.toFixed(2)),
      topByCtr,
      topByClicks
    };
  }, [processedAds]);

  // Data for Position Distribution Chart
  const positionDistributionData = useMemo(() => {
    const posMap: Record<string, { name: string; clicks: number; impressions: number; count: number; color: string }> = {
      homepage: { name: 'হোমপেজ', clicks: 0, impressions: 0, count: 0, color: POSITION_COLORS.homepage },
      product_list: { name: 'প্রোডাক্ট তালিকা', clicks: 0, impressions: 0, count: 0, color: POSITION_COLORS.product_list },
      category_page: { name: 'ক্যাটাগরি পেজ', clicks: 0, impressions: 0, count: 0, color: POSITION_COLORS.category_page },
      product_details: { name: 'প্রোডাক্ট বিস্তারিত', clicks: 0, impressions: 0, count: 0, color: POSITION_COLORS.product_details }
    };

    processedAds.forEach((ad) => {
      const pos = ad.position;
      if (posMap[pos]) {
        posMap[pos].clicks += ad.clicks;
        posMap[pos].impressions += ad.impressions;
        posMap[pos].count += 1;
      }
    });

    return Object.keys(posMap).map((key) => {
      const item = posMap[key];
      const ctr = item.impressions > 0 ? Number(((item.clicks / item.impressions) * 100).toFixed(2)) : 0;
      return {
        key,
        name: item.name,
        clicks: item.clicks,
        impressions: item.impressions,
        adsCount: item.count,
        ctr,
        color: item.color
      };
    });
  }, [processedAds]);

  // Filtered and Sorted Table Data
  const filteredTableData = useMemo(() => {
    let list = processedAds.filter((ad) => {
      if (selectedPosition !== 'all' && ad.position !== selectedPosition) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ad.title.toLowerCase().includes(q);
        const matchesAdvertiser = ad.advertiserName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAdvertiser) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [processedAds, selectedPosition, searchQuery, sortBy, sortOrder]);

  const handleSort = (column: 'clicks' | 'impressions' | 'ctr' | 'title') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Helper for CTR color & badge
  const getCtrBadge = (ctr: number) => {
    if (ctr >= 5) {
      return { label: 'খুব ভালো (High)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    } else if (ctr >= 2) {
      return { label: 'সন্তোষজনক (Good)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (ctr > 0) {
      return { label: 'সাধারণ (Average)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { label: 'কোনো ক্লিক নেই', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with description & CTR explanation */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-5 sm:p-6 text-white shadow-md border border-indigo-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 font-bold">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold">অ্যাড পারফরম্যান্স ও অ্যানালিটিক্স ড্যাশবোর্ড</h3>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              প্রতিটি বিজ্ঞাপনের মোট ক্লিক (Total Clicks), ইমপ্রেশন (Views) এবং ক্লিক-থ্রু রেট (CTR) পর্যবেক্ষণ করুন।
              রিপোর্টটি রিয়েল-টাইম কাস্টমার এনগেজমেন্টের উপর ভিত্তি করে তৈরি।
            </p>
          </div>

          {/* CTR Formula explanation pill */}
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs backdrop-blur-xs border border-white/10 shrink-0">
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-300">CTR সূত্র: </span>
              <span className="font-mono font-bold text-amber-300">(Clicks ÷ Impressions) × 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ক্লিক (Total Clicks)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MousePointer className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-600">
            {overallStats.totalClicks.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>সফল লিঙ্কে রিডাইরেকশন</span>
          </div>
        </div>

        {/* Total Impressions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ইমপ্রেশন (Impressions)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Eye className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {overallStats.totalImpressions.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>কাস্টমার স্ক্রিনে প্রদর্শিত</span>
          </div>
        </div>

        {/* Overall CTR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">গড় CTR (Click-Through Rate)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {overallStats.avgCtr}%
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className={`inline-block font-semibold ${overallStats.avgCtr >= 2 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {overallStats.avgCtr >= 2 ? 'উচ্চ রূপান্তর হার (High CTR)' : 'স্ট্যান্ডার্ড পারফরম্যান্স'}
            </span>
          </div>
        </div>

        {/* Top Performing Ad */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সর্বোচ্চ ক্লিকপ্রাপ্ত Ad</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Award className="h-4 w-4" />
            </span>
          </div>
          {overallStats.topByClicks ? (
            <div className="mt-2">
              <p className="text-sm font-bold text-slate-900 truncate" title={overallStats.topByClicks.title}>
                {overallStats.topByClicks.title}
              </p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-blue-600">{overallStats.topByClicks.clicks} ক্লিক</span>
                <span className="font-semibold text-emerald-600">{overallStats.topByClicks.ctr}% CTR</span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">এখনো কোনো ক্লিক রেকর্ড হয়নি</p>
          )}
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Total Clicks & Impressions (or CTR) per Ad */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">বিজ্ঞাপন অনুযায়ী এনগেজমেন্ট গ্রাফ</h4>
              <p className="text-xs text-slate-500">প্রতিটি বিজ্ঞাপনের মোট ক্লিক এবং ইমপ্রেশন বা CTR তুলনা</p>
            </div>

            {/* Metric Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setChartMetric('both')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  chartMetric === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                ক্লিক ও ভিউ
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('clicks')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  chartMetric === 'clicks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                শুধু ক্লিক
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('ctr')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  chartMetric === 'ctr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                শুধু CTR (%)
              </button>
            </div>
          </div>

          {processedAds.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-xs text-slate-400">
              কোনো বিজ্ঞাপনের ডাটা পাওয়া যায়নি
            </div>
          ) : (
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'ctr' ? (
                  <BarChart data={processedAds} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortTitle"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'ক্লিক-থ্রু রেট (CTR)']}
                      labelFormatter={(label: any) => `বিজ্ঞাপন: ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="ctr"
                      name="CTR (%)"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <BarChart data={processedAds} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortTitle"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        val,
                        name === 'clicks' ? 'মোট ক্লিক (Clicks)' : 'মোট ইমপ্রেশন (Views)'
                      ]}
                      labelFormatter={(label: any) => `বিজ্ঞাপন: ${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="clicks"
                      name="মোট ক্লিক (Clicks)"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />
                    {chartMetric === 'both' && (
                      <Bar
                        dataKey="impressions"
                        name="মোট ইমপ্রেশন (Views)"
                        fill="#cbd5e1"
                        radius={[6, 6, 0, 0]}
                      />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Position Breakdown Pie / Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">পজিশন ভিত্তিক ক্লিক শেয়ার</h4>
              <p className="text-xs text-slate-500">কোন স্থানে বিজ্ঞাপনে সবচেয়ে বেশি ক্লিক পড়ছে</p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionDistributionData}
                    dataKey="clicks"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {positionDistributionData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} ক্লিক`, name]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Position breakdown list */}
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
            {positionDistributionData.map((p) => {
              const clickShare = overallStats.totalClicks > 0
                ? ((p.clicks / overallStats.totalClicks) * 100).toFixed(0)
                : '0';
              return (
                <div key={p.key} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-700">{p.name}</span>
                    <span className="text-slate-400">({p.adsCount}টি Ad)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{p.clicks} ক্লিক</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {clickShare}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Table: Ad by Ad Total Clicks and CTR */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">বিজ্ঞাপন এনগেজমেন্ট তালিকা (Ad Performance Table)</h4>
            <p className="text-xs text-slate-500">প্রতিটি বিজ্ঞাপনের বিস্তারিত ক্লিক, ভিউ এবং CTR মেট্রিক্স</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px] flex-1 sm:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিজ্ঞাপন বা স্পন্সর খুঁজুন..."
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Position filter */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">সকল পজিশন</option>
              <option value="homepage">হোমপেজ</option>
              <option value="product_list">প্রোডাক্ট তালিকা</option>
              <option value="category_page">ক্যাটাগরি পেজ</option>
              <option value="product_details">প্রোডাক্ট বিস্তারিত</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>বিজ্ঞাপন (Ad / Sponsor)</span>
                    {sortBy === 'title' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3">পজিশন</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th
                  onClick={() => handleSort('impressions')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ইমপ্রেশন (Views)</span>
                    {sortBy === 'impressions' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('clicks')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>মোট ক্লিক (Clicks)</span>
                    {sortBy === 'clicks' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ctr')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CTR (%)</span>
                    {sortBy === 'ctr' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">পারফরম্যান্স রেটিং</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    কোনো বিজ্ঞাপনের ফলাফল পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredTableData.map((ad) => {
                  const badge = getCtrBadge(ad.ctr);
                  const maxClicksInList = Math.max(...processedAds.map((a) => a.clicks), 1);
                  const clickBarPercent = Math.min(100, Math.round((ad.clicks / maxClicksInList) * 100));

                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {ad.imageUrl ? (
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate" title={ad.title}>
                              {ad.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {ad.advertiserName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: POSITION_COLORS[ad.position] || '#64748b' }}
                        >
                          {POSITION_NAMES[ad.position] || ad.position}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ad.active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${ad.active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          />
                          {ad.active ? 'সক্রিয়' : 'বন্ধ'}
                        </span>
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
                        {ad.impressions.toLocaleString()}
                      </td>

                      {/* Clicks with micro progress bar */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-blue-600 text-sm">
                            {ad.clicks.toLocaleString()}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${clickBarPercent}%` }}
                            />
                          </div>
                          {ad.lastClickedAt && (
                            <span className="text-[10px] text-slate-400 mt-1" title={new Date(ad.lastClickedAt).toLocaleString('bn-BD')}>
                              সর্বশেষ: {new Date(ad.lastClickedAt).toLocaleDateString('bn-BD', { month: 'numeric', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CTR (%) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {ad.ctr}%
                        </span>
                      </td>

                      {/* Performance Rating */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {onPreviewAd && (
                            <button
                              type="button"
                              onClick={() => onPreviewAd(ad)}
                              className="rounded-lg p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                              title="লাইভ প্রিভিউ দেখুন"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {onEditAd && (
                            <button
                              type="button"
                              onClick={() => onEditAd(ad)}
                              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="বিজ্ঞাপন এডিট করুন"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                          )}
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="গন্তব্য ওয়েবসাইট লিঙ্ক"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary in Table */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>মোট {filteredTableData.length}টি বিজ্ঞাপনের পারফরম্যান্স প্রদর্শিত হচ্ছে</span>
          <div className="flex items-center gap-4">
            <span>
              ফিল্টারকৃত মোট ক্লিক: <strong className="text-slate-800">{filteredTableData.reduce((s, a) => s + a.clicks, 0)}</strong>
            </span>
            <span>
              ফিল্টারকৃত মোট ইমপ্রেশন: <strong className="text-slate-800">{filteredTableData.reduce((s, a) => s + a.impressions, 0)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
