import {
  xdicomrleMediaType,
  xdicomrleTransferSyntaxUID,
} from './mediaTypeXDicomRLE.js';
import {
  jpegMediaType,
  jpegTransferSyntaxUIDlossy1,
  jpegTransferSyntaxUIDlossy2,
  jpegTransferSyntaxUIDlossless,
} from './mediaTypeJPEG.js';
import { jllMediaType, jllTransferSyntaxUIDlossless } from './mediaTypeJLL.js';
import {
  jlsMediaType,
  jlsTransferSyntaxUID,
  jlsTransferSyntaxUIDlossless,
} from './mediaTypeJLS.js';
import {
  jp2MediaType,
  jp2TransferSyntaxUID,
  jp2TransferSyntaxUIDlossless,
} from './mediaTypeJP2.js';
import {
  octetStreamMediaType,
  octetStreamTransferSyntaxUID,
} from './mediaTypeOctetStream.js';

// NOTE: the position of the elements in the array indicates the mediaType
// priority when fetching an image. An element at the beginning of the array
// has the highest priority.
const mediaTypes = [
  {
    mediaType: xdicomrleMediaType,
    transferSyntaxUID: xdicomrleTransferSyntaxUID,
  },
  {
    mediaType: jpegMediaType,
    transferSyntaxUID: jpegTransferSyntaxUIDlossy1,
  },
  {
    mediaType: jpegMediaType,
    transferSyntaxUID: jpegTransferSyntaxUIDlossy2,
  },
  {
    mediaType: jpegMediaType,
    transferSyntaxUID: jpegTransferSyntaxUIDlossless,
  },
  {
    mediaType: jllMediaType,
    transferSyntaxUID: jllTransferSyntaxUIDlossless,
  },
  {
    mediaType: jlsMediaType,
    transferSyntaxUID: jlsTransferSyntaxUIDlossless,
  },
  {
    mediaType: jlsMediaType,
    transferSyntaxUID: jlsTransferSyntaxUID,
  },
  {
    mediaType: jp2MediaType,
    transferSyntaxUID: jp2TransferSyntaxUIDlossless,
  },
  {
    mediaType: jp2MediaType,
    transferSyntaxUID: jp2TransferSyntaxUID,
  },
  {
    mediaType: octetStreamMediaType,
    transferSyntaxUID: octetStreamTransferSyntaxUID,
  },
];

export { mediaTypes };
