cornerstone WADO Image Loader
=============================

A [cornerstone](https://github.com/chafey/cornerstone) Image Loader for DICOM P10 instances over
HTTP (WADO-URI) or DICOMWeb (WADO-RS).  This can be used to integrate cornerstone with WADO-URI
servers, DICOMWeb servers or any other HTTP based server that returns DICOM P10 instances
 (e.g. [Orthanc](http://www.orthanc-server.com/) or custom servers)

Troubleshooting
---------------

Having problems viewing your images with cornerstonWADOImageLoader?  Check out the
[troubleshooting guide](https://github.com/chafey/cornerstoneWADOImageLoader/wiki/troubleshooting).

Live Examples
---------------

[Click here for a live example of this library in use!](http://rawgithub.com/chafey/cornerstoneWADOImageLoader/master/examples/index.html)

You can also see it in action with the
[cornerstoneDemo application](https://github.com/chafey/cornerstoneDemo).

Install
-------

Get a packaged source file:

* [cornerstoneWADOImageLoader.js](https://raw.githubusercontent.com/chafey/cornerstoneWADOImageLoader/master/dist/cornerstoneWADOImageLoader.js)
* [cornerstoneWADOImageLoader.min.js](https://raw.githubusercontent.com/chafey/cornerstoneWADOImageLoader/master/dist/cornerstoneWADOImageLoader.min.js)

or from bower:

> bower install cornerstoneWADOImageLoader

Usage
-------

The cornerstoneWADOImageLoader depends on the following external libraries:

1. [jQuery](https://github.com/jquery/jquery)
2. [dicomParser](https://github.com/chafey/dicomParser) 
3. [cornerstone](https://github.com/chafey/cornerStone)

ImageIds
--------

The image loader prefix is 'wadouri' (note that the prefix dicomweb is also supported but is deprecated and will eventually
be removed).  Here are some example imageId's:

absolute url:

```
wadouri:http://cornerstonetech.org/images/ClearCanvas/USEcho/IM00001
```

relative url:

```
wadouri:/images/ClearCanvas/USEcho/IM00001
```

WADO-URI url:

```
wadouri:http://localhost:3333/wado?requestType=WADO&studyUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.1&seriesUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075541.2&objectUID=1.3.6.1.4.1.25403.166563008443.5076.20120418075557.1&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.1
```

[Orthanc](http://www.orthanc-server.com/) file endpoint URL:

```
wadouri:http://localhost:8042/instances/8cce70aa-576ad738-b76cb63f-caedb3c7-2b213aae/file
```

Note that the web server must support [Cross origin resource sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) 
or the image will fail to load.  If you are unable to get CORS enabled on the web server that you are loading DICOM P10
instances from, you can use a [reverse proxy](http://en.wikipedia.org/wiki/Reverse_proxy).  Here is a 
[simple Node.js based http-proxy](http://chafey.blogspot.com/2014/09/working-around-cors.html) that adds CORS headers
that you might find useful.

Key Features
------------

* Implements a [cornerstone ImageLoader](https://github.com/chafey/cornerstone/wiki/ImageLoader) for DICOM P10 Instances via a HTTP get request.
  * Can be used with a WADO-URI server
  * Can be used with Orthanc's file endpoint
  * Can be used with any server that returns DICOM P10 instances via HTTP GET
* Implements a [cornerstone ImageLoader](https://github.com/chafey/cornerstone/wiki/ImageLoader) for WADO-RS (DICOMWeb)
* Supports many popular transfer syntaxes and photometric interpretations [see full list](https://github.com/chafey/cornerstoneWADOImageLoader/blob/master/docs/TransferSyntaxes.md) and [codec](docs/Codecs.md) for more information.
* Framework to execute CPU intensive tasks in (web workers)[docs/WebWorkers.md]
  * Used for image decoding
  * Can be used for your own CPU intensive tasks (e.g. image processing)

Backlog
-------

* Support for images with pixel padding
* Support for high bit (e.g. mask out burned in overlays)
* Free up DICOM P10 instance after decoding to reduce memory consumption
* Add support for compressed images to WADO-RS loader
* Look at using EMSCRIPEN based build of IJG for JPEG
* Consolidate all EMSCRIPTEN codecs into one build to cut down on memory use and startup times
* Add support for bulk data items to WADO-RS Loader
* Add events to webWorkerManager so its activity can be monitored
* Add support for dynamically loading custom web worker tasks in webWorkerManager
* Add support for adjusting # of web workers dynamically (adding, removing)
* Add support for issuing progress events from web worker tasks

FAQ
===

_Why is this a separate library from cornerstone?_

Mainly to avoid adding a dependency to cornerstone for the DICOM parsing library.  While cornerstone is
intended to be used to display medical images that are stored in DICOM, cornerstone aims to simplify
the use of medical imaging and therefore tries to hide some of the complexity that exists within
DICOM.  It is also desirable to support display of non DICOM images so a DICOM independent image model
makes sense.

_How do I build this library myself?_

See the documentation [here](docs/Building.md)

_How do I add my own custom web worker tasks?_

See the documentation [here](docs/WebWorkers.md)

Copyright
============
Copyright 2016 Chris Hafey [chafey@gmail.com](mailto:chafey@gmail.com)
