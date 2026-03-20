"use client";

import { useState, useCallback } from "react";
import {
  registerDocument,
  verifyDocument,
  getTotalCount,
  getRegistrations,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

function Textarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <textarea
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Helper Functions ────────────────────────────────────────

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

function truncateAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function truncateHash(hash: string): string {
  if (!hash || hash.length < 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

// ── Main Component ───────────────────────────────────────────

type Tab = "verify" | "register" | "browse";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("verify");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Register form state
  const [registerHash, setRegisterHash] = useState("");
  const [registerDesc, setRegisterDesc] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Verify form state
  const [verifyHash, setVerifyHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofResult, setProofResult] = useState<{
    submitter: string;
    timestamp: number;
    description: string;
  } | null>(null);

  // Browse state
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Array<{
    submitter: string;
    timestamp: number;
    description: string;
  }>>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!registerHash.trim()) return setError("Enter a document hash");
    if (!registerDesc.trim()) return setError("Enter a description");
    setError(null);
    setIsRegistering(true);
    setTxStatus("Awaiting signature...");
    try {
      await registerDocument(walletAddress, registerHash.trim(), registerDesc.trim());
      setTxStatus("Document hash registered on-chain!");
      setRegisterHash("");
      setRegisterDesc("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRegistering(false);
    }
  }, [walletAddress, registerHash, registerDesc]);

  const handleVerify = useCallback(async () => {
    if (!verifyHash.trim()) return setError("Enter a document hash");
    setError(null);
    setIsVerifying(true);
    setProofResult(null);
    try {
      const result = await verifyDocument(verifyHash.trim(), walletAddress || undefined);
      if (result) {
        setProofResult({
          submitter: result.submitter,
          timestamp: result.timestamp,
          description: result.description,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }, [verifyHash, walletAddress]);

  const handleBrowse = useCallback(async () => {
    setError(null);
    setIsLoadingList(true);
    try {
      const count = await getTotalCount(walletAddress || undefined);
      setTotalCount(count || 0);
      if (count && count > 0) {
        const regs = await getRegistrations(0, Math.min(count, 50), walletAddress || undefined);
        setRegistrations(regs || []);
      } else {
        setRegistrations([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setIsLoadingList(false);
    }
  }, [walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "verify", label: "Verify", icon: <ShieldIcon />, color: "#34d399" },
    { key: "register", label: "Register", icon: <FileIcon />, color: "#7c6cf0" },
    { key: "browse", label: "Browse", icon: <ClockIcon />, color: "#4fc3f7" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#34d399]/20 border border-white/[0.06]">
                <ShieldIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Proof of Existence</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncateAddress(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Permissionless</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setProofResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Verify */}
            {activeTab === "verify" && (
              <div className="space-y-5">
                <MethodSignature 
                  name="verify" 
                  params="(hash: BytesN<32>)" 
                  returns="-> Option<Registration>" 
                  color="#34d399" 
                />
                <Input 
                  label="Document Hash (base64)" 
                  value={verifyHash} 
                  onChange={(e) => setVerifyHash(e.target.value)} 
                  placeholder="e.g. base64 encoded SHA-256 hash"
                />
                <ShimmerButton onClick={handleVerify} disabled={isVerifying} shimmerColor="#34d399" className="w-full">
                  {isVerifying ? <><SpinnerIcon /> Verifying...</> : <><ShieldIcon /> Verify Existence</>}
                </ShimmerButton>

                {proofResult && (
                  <div className="rounded-xl border border-[#34d399]/20 bg-[#34d399]/[0.05] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#34d399]">Proof Found</span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35 flex items-center gap-1.5">
                          <HashIcon /> Hash
                        </span>
                        <span className="font-mono text-sm text-white/80">{truncateHash(verifyHash)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35 flex items-center gap-1.5">
                          <ClockIcon /> Registered
                        </span>
                        <span className="font-mono text-sm text-white/80">{formatTimestamp(proofResult.timestamp)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35 flex items-center gap-1.5">
                          <FileIcon /> Submitter
                        </span>
                        <span className="font-mono text-sm text-white/80">{truncateAddress(proofResult.submitter)}</span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-xs text-white/35 mb-1">Description</p>
                        <p className="text-sm text-white/70">{proofResult.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!proofResult && !isVerifying && !error && verifyHash && (
                  <div className="rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.03] px-4 py-4 text-center">
                    <p className="text-sm text-[#f87171]/60">Hash not found on-chain</p>
                  </div>
                )}
              </div>
            )}

            {/* Register */}
            {activeTab === "register" && (
              <div className="space-y-5">
                <MethodSignature 
                  name="register" 
                  params="(hash: BytesN<32>, submitter: Address, description: String)" 
                  color="#7c6cf0" 
                />
                <Input 
                  label="Document Hash (base64)" 
                  value={registerHash} 
                  onChange={(e) => setRegisterHash(e.target.value)} 
                  placeholder="e.g. base64 encoded SHA-256 hash"
                />
                <Textarea 
                  label="Description" 
                  value={registerDesc} 
                  onChange={(e) => setRegisterDesc(e.target.value)} 
                  placeholder="e.g. Contract_v1.pdf, My Company Document, etc."
                  rows={3}
                />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handleRegister} disabled={isRegistering} shimmerColor="#7c6cf0" className="w-full">
                    {isRegistering ? <><SpinnerIcon /> Registering...</> : <><FileIcon /> Register Document</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to register documents
                  </button>
                )}

                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                  <p className="text-xs text-white/35">
                    <span className="text-[#7c6cf0] font-medium">Permissionless:</span> Anyone can register any document hash. 
                    No approval required.
                  </p>
                </div>
              </div>
            )}

            {/* Browse */}
            {activeTab === "browse" && (
              <div className="space-y-5">
                <MethodSignature 
                  name="get_registrations" 
                  params="(start: u32, end: u32)" 
                  returns="-> Vec<Registration>" 
                  color="#4fc3f7" 
                />
                <ShimmerButton onClick={handleBrowse} disabled={isLoadingList} shimmerColor="#4fc3f7" className="w-full">
                  {isLoadingList ? <><SpinnerIcon /> Loading...</> : <><ClockIcon /> Load Recent Registrations</>}
                </ShimmerButton>

                {totalCount !== null && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-white/35">Total Registered</span>
                    <span className="font-mono text-lg text-white/80">{totalCount}</span>
                  </div>
                )}

                {registrations.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {registrations.map((reg, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/35 flex items-center gap-1.5">
                            <HashIcon /> {truncateHash(verifyHash || `entry-${i}`)}
                          </span>
                          <span className="text-xs text-white/25">{formatTimestamp(reg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-white/60">{reg.description}</p>
                        <div className="pt-1 border-t border-white/[0.04] flex items-center justify-between">
                          <span className="text-xs text-white/25">Submitted by</span>
                          <span className="font-mono text-xs text-white/40">{truncateAddress(reg.submitter)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Proof of Existence &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span className="font-mono text-[9px] text-white/15">Permissionless</span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
