# jxpipe

A lightweight Cloudflare Worker designed to bridge the gap between JSON-only APIs and XML-based data consumers.

## Overview

`jxpipe` fetches a JSON response from a provided URL, converts the data structure into a valid XML format, and returns the result with the `application/xml` content type.

## Use Case: Google Sheets

Google Sheets lacks a native `IMPORTJSON` function. By using `jxpipe`, you can consume public JSON APIs directly within a spreadsheet using the built-in `IMPORTXML` function.

**Formula Example:**

```excel
=IMPORTXML("https://your-worker.workers.dev/?url=" & ENCODEURL("https://api.example.com/data"), "//root/item")
```

### Google Sheets Named Function

To simplify usage, you can define a custom function within Google Sheets.

#### How to create a named function

1. In Google Sheets, go to **Data** > **Named functions**.
2. Click **Add new function**.
3. Enter the details provided below and click **Next** then **Create**.

#### Function Definition

* **Function name**: `JXPIPE`
* **Function description**: Fetches JSON data via jxpipe and parses it using XPath.
* **Argument placeholders**: `json_url`, ``
* **Formula definition**:

    ```excel
    =IMPORTXML("https://your-worker-name.workers.dev/?url=" & ENCODEURL(json_url), xpath)
    ```

#### Additional Details

* **json_url**:
  * Description: The full URL of the source JSON API.
  * Example: `"https://api.github.com/repos/ntcho/jxpipe"`
* **xpath**:
  * Description: The XML path to the desired data.
  * Example: `"//root/name"` or `"//root/item"`

#### Usage Example

```excel
=JXPIPE("https://api.example.com/data.json", "//root/item/id")
```

## Roadmap

* **Method Support**: Support for POST and other HTTP verbs.
* **Authentication**: Forwarding of Bearer tokens or API keys via query parameters or headers.
* **Custom Root Tags**: Ability to define a custom name for the XML root element.
* **Key Sanitization**: Automatic regex-based cleaning of JSON keys that contain invalid XML characters.
