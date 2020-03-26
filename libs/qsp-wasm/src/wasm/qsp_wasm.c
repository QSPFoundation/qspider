#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING
#include "../../qsp/qsp/declarations.h"

#include "../../qsp/qsp/text.h"

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetVersion()
{
  return qspStringToC(QSP_STATIC_STR(QSP_VER));
}
