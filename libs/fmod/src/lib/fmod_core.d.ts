/* eslint-disable @typescript-eslint/camelcase, @typescript-eslint/class-name-casing */

import { System, RESULT, DSP_STATE, CREATESOUNDEXINFO } from './fmod_types';

export declare function FMODModule(fmodObject: FMOD): void;

interface Out<T> {
  val: T;
}

/**
 * FMOD Object Interface. Make sure to only call functions at and after onRuntimeInitialized.
 */
export interface FMOD {
  // #region Namespace Functions Wrap FMOD functions ///////////////////////////////////////////////////////////////////////

  // #region Low Level System Functions ////////////////////////////
  /**
   * Specify the level and delivery method of log messages when using the logging version of FMOD.
   * @param flags Mask of bits representing the desired log information. Note: LOG implies WARN and WARN implies ERROR.
   */
  Debug_Initialize(flags: DEBUG_FLAGS): RESULT;

  /**
   * Helper function to close a file manually, that is preloaded with FMOD.FS_createPreloadedFile
   * @param handle
   */
  file_close(handle: object): RESULT;
  /**
   * Helper function to open a file manually, that is preloaded with FMOD.FS_createPreloadedFile
   * @param system FMOD::System object handle
   * @param filename path and filename which matches the path/filename set up in FMOD.FS_createPreloadedFile if this is the system being used (ie not file callbacks)
   * @param filesize_out an integer with the size of the file is put in filesize_out.val
   * @param handle_out an object with the file handle is put in handle_out.val
   */
  file_open(
    system: System,
    filename: string,
    filesize_out: Out<number>,
    handle_out: Out<object>
  ): RESULT;
  /**
   * Helper function to read a file manually, that is preloaded with FMOD.FS_createPreloadedFile
   * @param handle Handle returned by the FMOD.file_open function
   * @param buffer memory address that would come from an internal FMOD memory address, not an array or string type object declared in the JS scope.  See Remarks
   * @param sizebytes Integer value with the number of bytes requested to be read from the file handle.
   * @param bytesread_out An integer with the number of bytes actually read is put in bytesread_out.val
   */
  file_read(
    handle: object,
    buffer: number,
    sizebytes: number,
    bytesread_out: Out<number>
  ): RESULT;
  /**
   * Helper function to seek a file manually, that is preloaded with FMOD.FS_createPreloadedFile
   * @param handle Handle returned by the FMOD.file_open function
   * @param pos offset in bytes to seek into the file, relatve to the start
   */
  file_seek(handle: object, pos: number): RESULT;
  /**
   * Returns a more verbose string version of the error code returned by any FMOD function.
   * @param result error code
   */
  ErrorString(result: RESULT): void;

  /**
   * Information function to retreive the state of fmod's disk access.
   * @param busy Address of an integer to receive the busy state of the disk at the current time.
   */
  File_GetDiskBusy(busy: Out<number>): RESULT;
  /**
   * Mutex function to synchronize user file reads with FMOD's file reads. This function tells fmod that you are using the disk so that it will block until you are finished with it.
   * @description This function also blocks if FMOD is already using the disk, so that you cannot do a read at the same time FMOD is reading.
   * @param busy 1 = you are about to perform a disk access. 0 = you are finished with the disk.
   */
  File_SetDiskBusy(busy: number): RESULT;

  /**
   * Returns information on the memory usage of FMOD. This information is byte accurate and counts all allocs and frees internally.
   * @param currentalloced Address of a variable that receives the currently allocated memory at time of call. Optional. Specify 0 or NULL to ignore.
   * @param maxalloced Address of a variable that receives the maximum allocated memory since System::init or Memory_Initialize. Optional. Specify 0 or NULL to ignore.
   * @param blocking Boolean indicating whether to favour speed or accuracy. Specifying true for this parameter will flush the DSP network to make sure all queued allocations happen immediately, which can be costly.
   */
  Memory_GetStats(
    currentalloced: Out<number>,
    maxalloced: Out<number>,
    blocking: boolean
  ): RESULT;

  /**
   * Specifies a method for FMOD to allocate memory, either through callbacks or its own internal memory management.
   * @description You can also supply a pool of memory for FMOD to work with and it will do so with no extra calls to malloc or free.
   * @param poolmem If you want a fixed block of memory for FMOD to use, pass it in here. Specify the length in poollen. Specifying NULL doesn't use internal management and it relies on callbacks.
   * @param poollen Length in bytes of the pool of memory for FMOD to use specified in poolmem. Specifying 0 turns off internal memory management and relies purely on callbacks. Length must be a multiple of 512.
   * @param userrealalloc Only supported if pool is NULL. Otherwise it overrides the FMOD internal calls to alloc. Compatible with ansi malloc().
   * @param userfree Only supported if pool is NULL. Otherwise it overrides the FMOD internal calls to free. Compatible with ansi free().
   */
  Memory_Initialize(
    poolmem,
    poollen: number,
    useralloc: MEMORY_ALLOC_CALLBACK,
    userrealloc: MEMORY_REALLOC_CALLBACK,
    userfree: MEMORY_FREE_CALLBACK,
    memtypeflags: MEMORY_TYPE
  ): RESULT;

  /**
   * FMOD System creation function. This must be called to create an FMOD System object before you can do anything else. Use this function to create 1, or multiple instances of FMOD System objects.
   * @param system Address of a pointer that receives the new FMOD System object. HTML5 Note - the object is written to system.val
   */
  System_Create(system: Out<System>): RESULT;

  /**
   * Mounts a local file so that FMOD can recognize it when calling a function that uses a filename (ie while using loadBank/createSound)
   * See https://kripken.github.io/emscripten-site/docs/api_reference/Filesystem-API.html#FS.createPreloadedFile for docs on FS_createPreloadedFile
   * ```typescript
   *
   * ```
   * @param virtualfoldername Parent folder, ie '/'
   * @param filename Filename to preload.
   * @param fullurl Path inside parent folder. ie the subdirectory.
   * @param canread Whether the file should have read permissions set from the program’s point of view
   * @param canwrite Whether the file should have write permissions set from the program’s point of view.
   */
  FS_createPreloadedFile(
    virtualfoldername: string,
    filename: string,
    fullurl: string,
    canread: boolean,
    canwrite: boolean,
    onLoad?: () => void
  ): RESULT;

  /**
   *
   * @param dsp_state FMOD_DSP_STATE handle passed into the DSP callback
   * @param blocksize offset in bytes to seek into the file, relatve to the start
   */
  getblocksize(dsp_state: DSP_STATE, blocksize: number): RESULT;
  /**
   *
   * @param dsp_state FMOD_DSP_STATE handle passed into the DSP callback
   * @param samplerate FMOD_DSP_STATE handle passed into the DSP callback
   */
  getsamplerate(dsp_state: DSP_STATE, samplerate: number): RESULT;

  /**
     *
     * @param dsp_state FMOD_DSP_STATE handle passed into the DSP callback
     * @param clock this DSP's current clock value in PCM samples.
     * @param offset this DSP's current mix offset value in PCM samples.  This may be a DSP that is only writing to part of the buffer.  Typically 0.  See length.
     * @param length this DSP's current mix length value in PCM samples.  This may be a DSP that is only writing to part of the buffer.  Typically the length of the DSP buffer.  See offset

     */
  getspeakermode(
    dsp_state: DSP_STATE,
    clock: number,
    offset: number,
    length: number
  ): RESULT;

  /**
     * Returns a value memory managed by FMOD. This sort of value is typically sound data that is passed to the user as an 'address' which is internal to FMOD. This avoids duplication of large buffers which waste memory, because everything is passed by reference in JS.
     * @param address
     * @param value
     * @param format
     * @description See https://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#accessing-memory for docs on getValue.
     * 'address' is a memory address, and only FMOD functions will return a memory address. Examples of this would be
    1. buffer parameter of FMOD_FILE_READ_CALLBACK
    2. data parameter of FMOD_CREATESOUNDEXINFO::pcmreadcallback,
    3. buffer parameter of FMOD_STUDIO_BANK_INFO::readcallback
    4. inbuffer parameter of FMOD_DSP::readcallback.
    'format' can be values like 'i8', 'i16', 'i32', 'i64', 'float', 'double' typically.
     */
  getValue(address, value: Out<number>, format: Out<string>): RESULT;
  /**
   * Frees memory that was allocated by FMOD internally.
   * @param memory Note! Currently FMOD.ReadFile is the only function that returns an object with memory allocated by FMOD
   */
  Memory_Free(memory: object): RESULT;
  /**
   * Read the entire contents of a file into memory, as a JS variable that contains nothing but a memory address.
   * @param system FMOD::System object handle
   * @param filename Filename of the file that is to be loaded, that has the path and filename that matches the preloaded path/filename if loaded in that fashion.
   * @param output The variable with the allocated memory containing the contents of the file.
   */
  ReadFile(system: System, filename: string, output: object): RESULT;
  /**
   * Writes a value to memory managed by FMOD. This sort of value is typically sound data that is passed to the user as an 'address' which is internal to FMOD. This avoids duplication of large buffers which waste memory, because everything is passed by reference in JS.
   * @param address Memory address returned by an FMOD function.  See remarks.
   * @param value A value which can be an integer or a real/floating point number.
   * @param format A format 'string' which identifies which type of value it is.  See Remarks
   */
  setValue(address, value: number, format: string): RESULT;
  // ======== Low Level Structures ============
  /**
   * Creates a default structure
   */
  _3D_ATTRIBUTES(): _3D_ATTRIBUTES;
  /**
   * Creates a default structure
   */
  ADVANCEDSETTINGS(): ADVANCEDSETTINGS;
  /**
   * Creates a default structure
   */
  ASYNCREADINFO(): ASYNCREADINFO;
  /**
   * Creates a default structure
   */
  CODEC_DESCRIPTION(): CODEC_DESCRIPTION;
  /**
   * Creates a default structure
   */
  CODEC_STATE(): CODEC_STATE;
  /**
   * Creates a default structure
   */
  CODEC_WAVEFORMAT(): CODEC_WAVEFORMAT;
  /**
   * Creates a default structure
   */
  COMPLEX(): COMPLEX;
  /**
   * Creates a default structure
   */
  CREATESOUNDEXINFO(): CREATESOUNDEXINFO;
  /**
   * Creates a default structure
   */
  DSP_BUFFER_ARRAY(): DSP_BUFFER_ARRAY;
  /**
   * Creates a default structure
   */
  DSP_DESCRIPTION(): DSP_DESCRIPTION;
  /**
   * Creates a default structure
   */
  DSP_METERING_INFO(): DSP_METERING_INFO;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_3DATTRIBUTES(): DSP_PARAMETER_3DATTRIBUTES;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_3DATTRIBUTES_MULTI(): DSP_PARAMETER_3DATTRIBUTES_MULTI;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_DESC(): DSP_PARAMETER_DESC;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_DESC_BOOL(): DSP_PARAMETER_DESC_BOOL;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_DESC_DATA(): DSP_PARAMETER_DESC_DATA;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_DESC_FLOAT(): DSP_PARAMETER_DESC_FLOAT;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_DESC_INT(): DSP_PARAMETER_DESC_INT;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_FFT(): DSP_PARAMETER_FFT;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_FLOAT_MAPPING(): DSP_PARAMETER_FLOAT_MAPPING;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_FLOAT_MAPPING_PIECEWISE_LINEAR(): DSP_PARAMETER_FLOAT_MAPPING_PIECEWISE_LINEAR;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_OVERALLGAIN(): DSP_PARAMETER_OVERALLGAIN;
  /**
   * Creates a default structure
   */
  DSP_PARAMETER_SIDECHAIN(): DSP_PARAMETER_SIDECHAIN;
  /**
   * Creates a default structure
   */
  DSP_STATE(): DSP_STATE;
  /**
   * Creates a default structure
   */
  DSP_STATE_DFT_FUNCTIONS(): DSP_STATE_DFT_FUNCTIONS;
  /**
   * Creates a default structure
   */
  DSP_STATE_FUNCTIONS(): DSP_STATE_FUNCTIONS;
  /**
   * Creates a default structure
   */
  DSP_STATE_PAN_FUNCTIONS(): DSP_STATE_PAN_FUNCTIONS;
  /**
   * Creates a default structure
   */
  ERRORCALLBACK_INFO(): ERRORCALLBACK_INFO;
  /**
   * Creates a default structure
   */
  GUID(): GUID;
  /**
   * Creates a default structure
   */
  OUTPUT_DESCRIPTION(): OUTPUT_DESCRIPTION;
  /**
   * Creates a default structure
   */
  OUTPUT_OBJECT3DINFO(): OUTPUT_OBJECT3DINFO;
  /**
   * Creates a default structure
   */
  OUTPUT_STATE(): OUTPUT_STATE;
  /**
   * Creates a default structure
   */
  PLUGINLIST(): PLUGINLIST;
  /**
   * Creates a default structure
   */
  REVERB_PROPERTIES(): REVERB_PROPERTIES;
  /**
   * Creates a default structure
   */
  TAG(): TAG;
  /**
   * Creates a default structure
   */
  VECTOR(): VECTOR;
}
