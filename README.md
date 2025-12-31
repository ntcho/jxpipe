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

## Roadmap

* **Method Support**: Support for POST and other HTTP verbs.
* **Authentication**: Forwarding of Bearer tokens or API keys via query parameters or headers.
* **Custom Root Tags**: Ability to define a custom name for the XML root element.
* **Key Sanitization**: Automatic regex-based cleaning of JSON keys that contain invalid XML characters.
