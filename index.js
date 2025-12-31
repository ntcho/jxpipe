/**
 * jxpipe (JSON to XML Pipe)
 *
 * This middleware facilitates data integration for XML-only consumers, primarily
 * targeting Google Sheets IMPORTXML. It bridges the gap between modern JSON APIs
 * and legacy spreadsheet functions by converting hierarchical data structures
 * into a valid XML tree in real-time.
 *
 * Logic:
 * 1. Enforces data integrity by verifying the source is JSON before processing.
 * 2. Normalizes JSON structures into XML-compatible nodes, mapping arrays to
 *    repeatable tags and objects to named elements.
 * 3. Sanitizes content to prevent structural breakage from reserved characters.
 * 4. Ensures a consistent root hierarchy to satisfy XML parsing requirements.
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    try {
      const response = await fetch(targetUrl);

      // Ensure the source provides JSON before attempting to parse.
      // This prevents the worker from wasting resources on HTML or binary data
      // that would eventually fail the JSON parsing step.
      const contentType = response.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        return new Response(
          `Target URL returned ${contentType} instead of application/json`,
          { status: 415 }
        );
      }

      if (!response.ok) {
        console.log(response);
        return new Response(
          `Target API error: ${response.status} ${response.statusText}`,
          {
          status: response.status,
          }
        );
      }

      const json = await response.json();
      let xmlBody;

      // Handle top-level primitives (strings, numbers, booleans) or nulls.
      // If the JSON is not an object or array, we wrap the raw value directly
      // to ensure the XML remains well-formed with a consistent structure.
      if (typeof json !== "object" || json === null) {
        xmlBody = `<value>${escapeXml(json)}</value>`;
      } else {
        xmlBody = jsonToXml(json);
      }

      const finalXml = `<?xml version="1.0" encoding="UTF-8"?><root>${xmlBody}</root>`;

      return new Response(finalXml, {
        headers: {
          "Content-Type": "application/xml",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      console.log(error);
      return new Response(`Worker Error: ${error.message}`, { status: 500 });
    }
  },
};

/**
 * Transforms JSON structures into XML nodes.
 *
 * For arrays, it uses a generic 'item' tag to maintain list integrity.
 * For objects, it uses keys as tag names. To prevent syntax errors in XML,
 * empty JSON keys are mapped to a fallback 'empty_key' tag.
 */
function jsonToXml(obj) {
  let xml = "";

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];

    // Resolve the XML tag name based on the key type or presence
    let tagName = key;
    if (Array.isArray(obj)) {
      tagName = "item";
    } else if (key === "") {
      tagName = "empty_key";
    }

    if (value === null || value === undefined) {
      xml += `<${tagName}/>`;
    } else if (typeof value === "object") {
      xml += `<${tagName}>${jsonToXml(value)}</${tagName}>`;
    } else {
      xml += `<${tagName}>${escapeXml(value)}</${tagName}>`;
    }
  }

  return xml;
}

/**
 * Sanitizes primitive values for XML compatibility.
 *
 * Prevents the XML parser from breaking when the JSON data contains
 * characters that have structural meaning in XML (like & or <).
 */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
