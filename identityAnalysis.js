import { getIdentityProfile } from "./identityProfiles.js";

export const IDENTITY_SIGNAL_STATUSES = Object.freeze([
  "match",
  "partial",
  "mismatch",
  "unknown",
]);

export const IDENTITY_SCORE_BANDS = Object.freeze([
  Object.freeze({ id: "low", min: 0, max: 39, label: "差异较多" }),
  Object.freeze({ id: "mixed", min: 40, max: 69, label: "部分接近" }),
  Object.freeze({ id: "close", min: 70, max: 89, label: "整体接近" }),
  Object.freeze({ id: "high", min: 90, max: 100, label: "高度一致" }),
]);

export const IDENTITY_PENDING_BAND = Object.freeze({
  id: "pending",
  min: null,
  max: null,
  label: "证据收集中",
});

export const IDENTITY_MIN_COVERAGE = 25;

const STATUS_VALUES = Object.freeze({
  match: 1,
  partial: 0.6,
  mismatch: 0,
  unknown: 0.5,
});

const STATUS_SET = new Set(IDENTITY_SIGNAL_STATUSES);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeSignal(signal) {
  const candidate = signal && typeof signal === "object" ? signal : {};
  const status = STATUS_SET.has(candidate.status) ? candidate.status : "unknown";
  const confidence =
    status === "unknown" ? 0 : clamp(finiteNumber(candidate.confidence, 1), 0, 1);

  return {
    status,
    confidence,
    evidence: candidate.evidence ?? null,
    source: candidate.source ?? null,
  };
}

/**
 * 将低置信度的已知信号向 0.5 的中性值回归。
 * unknown 固定为中性值，但不计入证据覆盖率。
 */
function adjustedSignalValue(status, confidence) {
  if (status === "unknown") return STATUS_VALUES.unknown;
  return 0.5 + (STATUS_VALUES[status] - 0.5) * confidence;
}

function textForStatus(check, status) {
  switch (status) {
    case "match":
      return check.matchText;
    case "partial":
      return check.partialText;
    case "mismatch":
      return check.mismatchText;
    default:
      return check.pendingText;
  }
}

function reasonFromDetail(detail) {
  return {
    id: detail.id,
    label: detail.label,
    text: detail.text,
    evidence: detail.evidence,
    weight: detail.weight,
    confidence: detail.confidence,
    impact: detail.impact,
  };
}

function sortByImpact(items) {
  return items.sort(
    (left, right) =>
      right.impact - left.impact || right.weight - left.weight || left.label.localeCompare(right.label, "zh-CN"),
  );
}

export function getIdentityScoreBand(score) {
  if (score == null || score === "" || !Number.isFinite(Number(score))) {
    return IDENTITY_PENDING_BAND;
  }
  const normalizedScore = clamp(round(finiteNumber(score, 0)), 0, 100);
  return (
    IDENTITY_SCORE_BANDS.find(
      (band) => normalizedScore >= band.min && normalizedScore <= band.max,
    ) ?? IDENTITY_SCORE_BANDS[0]
  );
}

function buildSummary(profile, score, coverage, isScoreReady) {
  const subject = profile.target.summarySubject || profile.target.label || profile.name;

  if (!isScoreReady) {
    return `当前核心证据仍不完整，需获得更多环境信号后再分析与${subject}的匹配程度。`;
  }

  const band = getIdentityScoreBand(score);
  if (band.id === "high") {
    return `你的数字环境与${subject}高度一致。`;
  }
  if (band.id === "close") {
    return `你的环境整体接近${subject}，但仍存在部分待核对特征。`;
  }
  if (band.id === "mixed") {
    return `你的环境与${subject}部分接近，同时存在若干不同的环境信号。`;
  }
  return `你的环境与${subject}的典型信号差异较多，更接近其他网络或设备环境。`;
}

function matchingCaps(profile, details, scoreBeforeCaps) {
  const detailMap = new Map(details.map((detail) => [detail.id, detail]));

  return profile.criticalRules
    .map((rule) => {
      const detail = detailMap.get(rule.signalId);
      const statuses = Array.isArray(rule.statuses) ? rule.statuses : ["mismatch"];
      const minimumConfidence = clamp(finiteNumber(rule.minConfidence, 0), 0, 1);
      const cap = clamp(round(finiteNumber(rule.cap, 100)), 0, 100);

      if (
        !detail ||
        !statuses.includes(detail.status) ||
        detail.confidence < minimumConfidence ||
        scoreBeforeCaps <= cap
      ) {
        return null;
      }

      return {
        ruleId: rule.id,
        signalId: rule.signalId,
        cap,
        reason: rule.reason,
        evidence: detail.evidence,
        confidence: detail.confidence,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.cap - right.cap);
}

function evaluateScoreReadiness(profile, details, coverage) {
  const configured = profile.scoreReadiness ?? {};
  const minCoverage = clamp(
    round(finiteNumber(configured.minCoverage, IDENTITY_MIN_COVERAGE)),
    0,
    100,
  );
  const detailMap = new Map(details.map((detail) => [detail.id, detail]));
  const requiredSignalGroups = Array.isArray(configured.requiredSignalGroups)
    ? configured.requiredSignalGroups.filter((group) => Array.isArray(group) && group.length > 0)
    : [];
  const missingSignalGroups = requiredSignalGroups.filter(
    (group) =>
      !group.some((signalId) => {
        const detail = detailMap.get(signalId);
        return detail && detail.status !== "unknown" && detail.confidence > 0;
      }),
  );

  return {
    minCoverage,
    coverageReady: coverage >= minCoverage,
    coreSignalsReady: missingSignalGroups.length === 0,
    missingSignalGroups: missingSignalGroups.map((group) => [...group]),
  };
}

/**
 * 根据目标画像动态分析数字环境匹配度。
 *
 * @param {string} profileId 画像 ID；无效 ID 会安全回退到 generic。
 * @param {Record<string, {status?: string, confidence?: number, evidence?: unknown, source?: unknown}>} signals
 *   以画像 check.id 为键的环境信号。
 * @returns {{
 *   profile: object,
 *   score: number | null,
 *   scoreBeforeCaps: number | null,
 *   estimatedScore: number,
 *   estimatedScoreBeforeCaps: number,
 *   isScoreReady: boolean,
 *   coverage: number,
 *   band: object,
 *   summary: string,
 *   like: object[],
 *   partial: object[],
 *   unlike: object[],
 *   differences: object[],
 *   pending: object[],
 *   details: object[],
 *   advice: object[],
 *   caps: object[],
 *   readiness: object
 * }}
 */
export function analyzeIdentity(profileId, signals = {}) {
  const profile = getIdentityProfile(profileId) ?? getIdentityProfile("generic");
  const signalMap = signals && typeof signals === "object" && !Array.isArray(signals) ? signals : {};

  let weightedScore = 0;
  let coveredWeight = 0;

  const details = profile.checks.map((check) => {
    const weight = profile.weights[check.id];
    const signal = normalizeSignal(signalMap[check.id]);
    const adjustedValue = adjustedSignalValue(signal.status, signal.confidence);
    const scoreContribution = weight * adjustedValue;
    const impact =
      signal.status === "unknown"
        ? 0
        : signal.status === "match"
          ? weight * signal.confidence
          : weight * signal.confidence * (1 - STATUS_VALUES[signal.status]);

    weightedScore += scoreContribution;
    if (signal.status !== "unknown") coveredWeight += weight * signal.confidence;

    return {
      id: check.id,
      label: check.label,
      description: check.description,
      status: signal.status,
      confidence: signal.confidence,
      evidence: signal.evidence,
      source: signal.source,
      weight,
      adjustedValue: round(adjustedValue, 4),
      scoreContribution: round(scoreContribution, 2),
      impact: round(impact, 2),
      text: textForStatus(check, signal.status),
    };
  });

  const estimatedScoreBeforeCaps = clamp(round(weightedScore), 0, 100);
  const coverage = clamp(round(coveredWeight), 0, 100);
  const calculatedCaps = matchingCaps(profile, details, estimatedScoreBeforeCaps);
  const estimatedScore = calculatedCaps.reduce(
    (currentScore, cap) => Math.min(currentScore, cap.cap),
    estimatedScoreBeforeCaps,
  );
  const readiness = evaluateScoreReadiness(profile, details, coverage);
  const isScoreReady = readiness.coverageReady && readiness.coreSignalsReady;
  const scoreBeforeCaps = isScoreReady ? estimatedScoreBeforeCaps : null;
  const score = isScoreReady ? estimatedScore : null;
  const caps = isScoreReady ? calculatedCaps : [];
  const band = isScoreReady ? getIdentityScoreBand(score) : IDENTITY_PENDING_BAND;

  const like = sortByImpact(
    details.filter((detail) => detail.status === "match").map(reasonFromDetail),
  );
  const partial = sortByImpact(
    details.filter((detail) => detail.status === "partial").map(reasonFromDetail),
  );
  const unlike = sortByImpact(
    details.filter((detail) => detail.status === "mismatch").map(reasonFromDetail),
  );
  const differences = sortByImpact([...unlike, ...partial]);
  const pending = details
    .filter((detail) => detail.status === "unknown")
    .map(reasonFromDetail);

  const checkMap = new Map(profile.checks.map((check) => [check.id, check]));
  const advice = differences
    .map((reason) => {
      const configuredCheck = checkMap.get(reason.id);
      return {
        id: reason.id,
        text: configuredCheck.advice,
        priority: reason.impact,
      };
    })
    .filter((item) => typeof item.text === "string" && item.text.length > 0)
    .sort((left, right) => right.priority - left.priority);

  return {
    profile,
    score,
    scoreBeforeCaps,
    estimatedScore,
    estimatedScoreBeforeCaps,
    isScoreReady,
    coverage,
    band,
    summary: buildSummary(profile, estimatedScore, coverage, isScoreReady),
    like,
    partial,
    unlike,
    differences,
    pending,
    details,
    advice,
    caps,
    readiness,
  };
}
