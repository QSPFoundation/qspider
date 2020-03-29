#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING

#include "../../qsp/qsp/declarations.h"

#include "../../qsp/qsp/callbacks.h"
#include "../../qsp/qsp/game.h"
#include "../../qsp/qsp/locations.h"
#include "../../qsp/qsp/text.h"
#include "../../qsp/qsp/errors.h"

typedef struct
{
  int code;
  QSP_CHAR *description;
  QSP_CHAR *location;
  int actionIndex;
  int line;
} QSPErrorData;

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetVersion()
{
  return qspStringToC(QSP_STATIC_STR(QSP_VER));
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPLoadGameWorld(const void *data, int dataSize, QSP_CHAR *fileName)
{
  if (qspIsExitOnError && qspErrorNum)
  {
    return QSP_FALSE;
  }
  qspResetError();
  if (qspIsDisableCodeExec)
  {
    return QSP_FALSE;
  }
  qspOpenQuestFromData((char *)data, dataSize, qspStringFromC(fileName), QSP_TRUE);
  if (qspErrorNum)
    return QSP_FALSE;
  return QSP_TRUE;
}

EMSCRIPTEN_KEEPALIVE
QSPErrorData *QSPGetLastError()
{
  QSPErrorData *error = (QSPErrorData *)malloc(sizeof(QSPErrorData));
  error->code = qspErrorNum;
  error->location = qspStringToC(qspErrorLoc >= 0 && qspErrorLoc < qspLocsCount ? qspLocs[qspErrorLoc].Name : qspNullString);
  error->description = qspStringToC(qspGetErrorDesc(qspErrorNum));
  error->actionIndex = qspErrorActIndex;
  error->line = qspErrorLine;

  return error;
}
