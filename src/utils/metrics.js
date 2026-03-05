/**
 * Metrics Collection System
 * Simple metrics collection for Prometheus-style endpoints
 */

class MetricsCollector {
  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  /**
   * Increment a counter
   */
  increment(name, labels = {}) {
    const key = this.getKey(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  /**
   * Set a gauge value
   */
  setGauge(name, value, labels = {}) {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name, value, labels = {}) {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  /**
   * Get metrics in Prometheus format
   */
  getPrometheusFormat() {
    const lines = [];

    // Counters
    for (const [key, value] of this.counters.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      lines.push(`${name}${labelStr} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      lines.push(`${name}${labelStr} ${value}`);
    }

    // Histograms (simplified - just count and sum)
    for (const [key, values] of this.histograms.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      lines.push(`${name}_sum${labelStr} ${sum}`);
      lines.push(`${name}_count${labelStr} ${count}`);
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Get metrics as JSON
   */
  getJSON() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([k, v]) => [
          k,
          { values: v, sum: v.reduce((a, b) => a + b, 0), count: v.length }
        ])
      )
    };
  }

  getKey(name, labels) {
    const labelStr = JSON.stringify(labels);
    return `${name}${labelStr}`;
  }

  parseKey(key) {
    const match = key.match(/^(.+?)(\{.*\})?$/);
    return {
      name: match[1],
      labels: match[2] ? JSON.parse(match[2]) : {}
    };
  }

  formatLabels(labels) {
    if (Object.keys(labels).length === 0) return "";
    const labelPairs = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `{${labelPairs}}`;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Export singleton
export const metrics = new MetricsCollector();

/**
 * Express middleware to track request metrics
 */
export function metricsMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    metrics.increment("http_requests_total", {
      method: req.method,
      status: res.statusCode,
      route: req.route?.path || req.path
    });
    metrics.recordHistogram("http_request_duration_ms", duration, {
      method: req.method,
      route: req.route?.path || req.path
    });
  });

  next();
}
