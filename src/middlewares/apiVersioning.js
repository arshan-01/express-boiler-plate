/**
 * API Versioning Middleware
 * Handles version negotiation and deprecation headers
 */

/**
 * Version negotiation middleware
 * Extracts API version from Accept header or query parameter
 * Sets req.apiVersion for use in routes
 */
export function versionNegotiation(req, res, next) {
  // Check Accept header: application/vnd.api+json;version=1
  const acceptHeader = req.headers.accept || "";
  const versionMatch = acceptHeader.match(/version[=:](\d+)/i);
  
  // Check query parameter: ?version=1
  const queryVersion = req.query.version;
  
  // Check path parameter (if using /api/v1/ pattern)
  const pathVersion = req.path.match(/^\/v(\d+)\//)?.[1];
  
  // Priority: path > query > header
  const version = pathVersion || queryVersion || versionMatch?.[1] || "1";
  
  req.apiVersion = parseInt(version, 10);
  req.apiVersionString = `v${req.apiVersion}`;
  
  next();
}

/**
 * Deprecation header middleware
 * Adds deprecation warnings for old API versions
 * @param {number} deprecatedVersion - Version to deprecate
 * @param {string} sunsetDate - ISO date when version will be removed
 */
export function deprecationHeader(deprecatedVersion, sunsetDate) {
  return (req, res, next) => {
    if (req.apiVersion === deprecatedVersion) {
      res.setHeader("Deprecation", "true");
      res.setHeader("Sunset", sunsetDate);
      res.setHeader(
        "Link",
        `<${req.protocol}://${req.get("host")}/api/v${deprecatedVersion + 1}>; rel="successor-version"`
      );
    }
    next();
  };
}

/**
 * Version validation middleware
 * Rejects requests for unsupported versions
 * @param {number[]} supportedVersions - Array of supported version numbers
 */
export function validateVersion(supportedVersions = [1]) {
  return (req, res, next) => {
    if (!supportedVersions.includes(req.apiVersion)) {
      return res.status(400).json({
        success: false,
        message: `API version ${req.apiVersion} is not supported`,
        supportedVersions
      });
    }
    next();
  };
}
