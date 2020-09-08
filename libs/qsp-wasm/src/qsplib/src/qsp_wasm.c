#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING

#include "qsp/declarations.h"

#include "qsp/callbacks.h"
#include "qsp/common.h"
#include "qsp/game.h"
#include "qsp/locations.h"
#include "qsp/actions.h"
#include "qsp/objects.h"
#include "qsp/text.h"
#include "qsp/time.h"
#include "qsp/coding.h"
#include "qsp/statements.h"
#include "qsp/mathops.h"
#include "qsp/variables.h"
#include "qsp/errors.h"

typedef struct
{
  int code;
  QSP_CHAR *description;
  QSP_CHAR *location;
  int actionIndex;
  int line;
} QSPErrorData;

typedef struct
{
  QSP_CHAR *Name;
  QSP_CHAR *Image;
} QSPListItemC;

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetVersion()
{
  return qspStringToC(QSP_STATIC_STR(QSP_VER));
}

EMSCRIPTEN_KEEPALIVE
void QSPInit()
{
  qspIsDebug = QSP_FALSE;
  qspRefreshCount = qspFullRefreshCount = 0;
  qspQstCRC = 0;
  qspRealCurLoc = -1;
  qspRealActIndex = -1;
  qspRealLine = 0;
  qspMSCount = 0;
  qspLocs = 0;
  qspLocsNames = 0;
  qspLocsCount = 0;
  qspCurLoc = -1;
  qspTimerInterval = 0;
  qspCurIsShowObjs = qspCurIsShowActs = qspCurIsShowVars = qspCurIsShowInput = QSP_TRUE;
  setlocale(LC_ALL, QSP_LOCALE);
  qspSetSeed(0);
  qspPrepareExecution();
  qspMemClear(QSP_TRUE);
  qspInitCallBacks();
  qspInitStats();
  qspInitMath();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPLoadGameWorld(const void *data, int dataSize, QSP_CHAR *fileName, QSP_BOOL isNewGame)
{
  printf("QSPLoadGameWorld\n");
  if (qspIsExitOnError && qspErrorNum)
  {
    return QSP_FALSE;
  }
  qspResetError();
  if (qspIsDisableCodeExec)
  {
    return QSP_FALSE;
  }
  qspOpenQuestFromData((char *)data, dataSize, isNewGame);
  if (qspErrorNum)
    return QSP_FALSE;
  return QSP_TRUE;
}

EMSCRIPTEN_KEEPALIVE
void *QSPSaveGame(int *realSize)
{
  QSPString data;
  int size;
  if (qspIsExitOnError && qspErrorNum)
    return qspStringToC(qspEmptyString);
  qspPrepareExecution();
  if (qspIsDisableCodeExec)
    return qspStringToC(qspEmptyString);
  data = qspSaveGameStatusToString();
  if (!data.Str)
  {
    *realSize = 0;
    return qspStringToC(qspEmptyString);
  }
  size = qspStrLen(data) * sizeof(QSP_CHAR);
  *realSize = size;
  char *buf = malloc(size);
  memcpy(buf, data.Str, size);
  qspFreeString(data);
  qspCallRefreshInt(QSP_FALSE);
  return buf;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPOpenSavedGame(const void *data, int dataSize)
{
  printf("QSPOpenSavedGame\n");
  if (qspIsExitOnError && qspErrorNum)
    return QSP_FALSE;
  qspPrepareExecution();
  if (qspIsDisableCodeExec)
    return QSP_FALSE;
  qspOpenGameStatusFromString(qspStringFromLen((QSP_CHAR *)data, dataSize / sizeof(QSP_CHAR)));
  if (qspErrorNum)
    return QSP_FALSE;
  qspCallRefreshInt(QSP_FALSE);
  return QSP_TRUE;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPRestartGame()
{
  printf("QSPRestartGame\n");
  if (qspIsExitOnError && qspErrorNum)
    return QSP_FALSE;
  qspPrepareExecution();
  if (qspIsDisableCodeExec)
    return QSP_FALSE;
  qspNewGame(QSP_TRUE);
  if (qspErrorNum)
    return QSP_FALSE;
  qspCallRefreshInt(QSP_FALSE);
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

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPIsMainDescChanged()
{
  return qspIsMainDescChanged;
}

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetMainDesc()
{
  return qspStringToC(qspCurDesc);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPIsVarsDescChanged()
{
  return qspIsVarsDescChanged;
}

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetVarsDesc()
{
  return qspStringToC(qspCurVars);
}

/* Actions */

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPIsActionsChanged()
{
  return qspIsActionsChanged;
}

EMSCRIPTEN_KEEPALIVE
QSPListItemC *QSPGetActions(int *count)
{
  *count = qspCurActionsCount;
  QSPListItemC *items = (QSPListItemC *)malloc(qspCurActionsCount * sizeof(QSPListItemC));
  for (int i = 0; i < qspCurActionsCount; ++i)
  {
    items[i].Name = qspStringToC(qspCurActions[i].Desc);
    items[i].Image = qspStringToC(qspCurActions[i].Image);
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPSelectAction(int ind)
{
  if (ind >= 0 && ind < qspCurActionsCount && ind != qspCurSelAction)
  {
    if (qspIsExitOnError && qspErrorNum)
      return QSP_FALSE;
    qspPrepareExecution();
    if (qspIsDisableCodeExec)
      return QSP_FALSE;
    qspCurSelAction = ind;
    qspExecLocByVarNameWithArgs(QSP_STATIC_STR(QSP_FMT("ONACTSEL")), 0, 0);
    if (qspErrorNum)
      return QSP_FALSE;
    qspExecAction(qspCurSelAction);
    if (qspErrorNum)
      return QSP_FALSE;
    qspCallRefreshInt(QSP_FALSE);
  }
  return QSP_TRUE;
}

/* Objects */

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPIsObjectsChanged()
{
  return qspIsObjectsChanged;
}

EMSCRIPTEN_KEEPALIVE
QSPListItemC *QSPGetObjects(int *count)
{
  *count = qspCurObjectsCount;
  QSPListItemC *items = (QSPListItemC *)malloc(qspCurObjectsCount * sizeof(QSPListItemC));
  for (int i = 0; i < qspCurObjectsCount; ++i)
  {
    items[i].Name = qspStringToC(qspCurObjects[i].Desc);
    items[i].Image = qspStringToC(qspCurObjects[i].Image);
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPSelectObject(int index)
{
  if (index >= 0 && index < qspCurObjectsCount && index != qspCurSelObject)
  {
    if (qspIsExitOnError && qspErrorNum)
      return QSP_FALSE;
    qspPrepareExecution();
    if (qspIsDisableCodeExec)
      return QSP_FALSE;
    qspCurSelObject = index;
    qspExecLocByVarNameWithArgs(QSP_STATIC_STR(QSP_FMT("ONOBJSEL")), 0, 0);
    if (qspErrorNum)
      return QSP_FALSE;
    qspCallRefreshInt(QSP_FALSE);
  }
  return QSP_TRUE;
}

/* variables */
EMSCRIPTEN_KEEPALIVE
int QSPGetVarValuesCount(QSP_CHAR *name)
{
  QSPVar *var;
  if (qspIsExitOnError && qspErrorNum)
    return 0;
  qspResetError();
  var = qspVarReference(qspStringFromC(name), QSP_FALSE);
  if (qspErrorNum)
    return 0;
  return var->ValsCount;
}

EMSCRIPTEN_KEEPALIVE
int QSPGetVarNumValue(QSP_CHAR *name, int ind)
{
  QSPVar *var;
  if (qspIsExitOnError && qspErrorNum)
    return 0;
  qspResetError();
  var = qspVarReference(qspStringFromC(name), QSP_FALSE);
  if (qspErrorNum || ind < 0 || ind >= var->ValsCount)
    return 0;
  return var->Values[ind].Num;
}

EMSCRIPTEN_KEEPALIVE
QSP_CHAR *QSPGetVarStrValue(QSP_CHAR *name, int ind)
{
  QSPVar *var;
  if (qspIsExitOnError && qspErrorNum)
    return qspStringToC(qspEmptyString);
  qspResetError();
  var = qspVarReference(qspStringFromC(name), QSP_FALSE);
  if (qspErrorNum || ind < 0 || ind >= var->ValsCount)
    return qspStringToC(qspEmptyString);
  return qspStringToC(var->Values[ind].Str);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPExecString(QSP_CHAR *s)
{
  if (qspIsExitOnError && qspErrorNum)
    return QSP_FALSE;
  qspPrepareExecution();
  if (qspIsDisableCodeExec)
    return QSP_FALSE;
  qspExecStringAsCodeWithArgs(qspStringFromC(s), 0, 0, 0);
  if (qspErrorNum)
    return QSP_FALSE;
  qspCallRefreshInt(QSP_FALSE);
  return QSP_TRUE;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPExecCounter()
{
  if (!qspIsInCallBack)
  {
    qspPrepareExecution();
    qspExecLocByVarNameWithArgs(QSP_STATIC_STR(QSP_FMT("COUNTER")), 0, 0);
    if (qspErrorNum)
      return QSP_FALSE;
    qspCallRefreshInt(QSP_FALSE);
  }
  return QSP_TRUE;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL QSPExecUserInput(QSP_CHAR *text)
{
  if (qspIsExitOnError && qspErrorNum)
    return QSP_FALSE;
  qspUpdateText(&qspCurInput, qspStringFromC(text));
  qspPrepareExecution();
  if (qspIsDisableCodeExec)
    return QSP_FALSE;
  qspExecLocByVarNameWithArgs(QSP_STATIC_STR(QSP_FMT("USERCOM")), 0, 0);
  if (qspErrorNum)
    return QSP_FALSE;
  qspCallRefreshInt(QSP_FALSE);
  return QSP_TRUE;
}
