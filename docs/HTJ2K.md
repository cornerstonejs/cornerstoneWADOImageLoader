# Using HTJ2K images with cornerstoneWADOImageLoader

## Considerations

As High throughput JPEG2000 is not (yet) an officially supported DICOM transfer
syntax, some modifications are necessary to the standard way of loading a DICOM
P10 image file, particulary as HTJ2K supports partial bytestream rendering at
lower resolutions. Several strategies could be used to accomplish this:

1. Separate the DICOM P10 file metadata from the HTJ2K compressed pixel data
   (this is the strategy employed here). An advantage of this strategy is simple
   byte range HTTP requests against the pixel data file (i.e.
   `byteRange: 'bytes=0-20000'`) to load lower resolution images. A downside is
   the need to issue two network requests for each image (one for the P10
   metadata file, and a second for the pixel data).
2. Add the HTJ2K compressed pixel data into the `PixelData` element of the P10
   file, with perhaps a nonstandard transfer syntax set. This would allow a
   single network request, but makes the byte range requests more complicated,
   as the byte offset of the `PixelData` element would need to be stored ahead
   of time to calculate the correct byte range for the HTTP request.

## Usage

Using Strategy 1 above, the HTJ2K compressed pixel data file should have the
extension `.jph`. The corresponding DICOM P10 metadata file (essentially the
original P10 file but with no `PixelData` element) should be **in the same
directory with the same filename but with the extension `.metadata.dcm`.** The
file should be loaded with the prefix `jphuri:` prepended to the url.

For example, a standard uncompressed `image1.dcm` file could be converted to
HTJ2K by (1) extracting the pixel data and compressing with HTJ2K, saving as
`image1.jph`, (2) saving the P10 metadata (sans `PixelData`) as
`image1.metadata.dcm`, and (3) loading the image using the url
`jphuri:http://myserver/image1.jph`. The image loader will automatically issue
the request for the metadata file. See the example
[here](../examples/jphuri/index.html).

Lower resolution images may also be dynamically rendered by only requesting the
first _n_ bytes of the image, by setting the `byteRange` option:

```js
cornerstone.loadAndCacheImage(imageId, {
  byteRange: 'bytes=0-20000',
});
```
