#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING

#include "qsp/declarations.h"
#include "qsp/bindings/default/qsp_default.h"

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

int MAX_LIST_ITEMS = 1000;

EMSCRIPTEN_KEEPALIVE
void init()
{
  QSPInit();
}

EMSCRIPTEN_KEEPALIVE
void dispose()
{
  QSPDeInit();
}

EMSCRIPTEN_KEEPALIVE
QSPString getVersion()
{
  return QSPGetVersion();
}

/* Main desc */
EMSCRIPTEN_KEEPALIVE
QSPString getMainDesc()
{
  return QSPGetMainDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isMainDescChanged()
{
  return QSPIsMainDescChanged();
}

/* Vars desc */
EMSCRIPTEN_KEEPALIVE
QSPString getVarsDesc()
{
  return QSPGetVarsDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isVarsDescChanged()
{
  return QSPIsVarsDescChanged();
}

/* Actions */
EMSCRIPTEN_KEEPALIVE
int getActions(QSPListItem *items)
{
  return QSPGetActions(items, MAX_LIST_ITEMS);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL selectAction(int index)
{
  QSPSetSelActionIndex(index, QSP_TRUE);
  return QSPExecuteSelActionCode(QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isActionsChanged()
{
  return QSPIsActionsChanged();
}

/* Objects */
EMSCRIPTEN_KEEPALIVE
int getObjects(QSPListItem *items)
{
  return QSPGetObjects(items, MAX_LIST_ITEMS);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL selectObject(int index)
{
  return QSPSetSelObjectIndex(index, QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isObjectsChanged()
{
  return QSPIsObjectsChanged();
}

/* Game */
EMSCRIPTEN_KEEPALIVE
QSP_BOOL loadGameData(const void *data, int dataSize, QSP_BOOL isNewGame)
{
  return QSPLoadGameWorldFromData(data, dataSize, isNewGame);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL restartGame()
{
  return QSPRestartGame(QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
void *saveGameData(int *realSize)
{
  realSize = 0;
  int fileSize = 64 * 1024;
  void *fileData = (void *)malloc(fileSize);
  if (!QSPSaveGameAsData(fileData, fileSize, realSize, QSP_FALSE))
  {
    fileSize = *realSize;
    if (!fileSize)
    {
      fileData = (void *)realloc(fileData, fileSize);
      if (!QSPSaveGameAsData(fileData, fileSize, realSize, QSP_FALSE))
      {
        free(fileData);
        return fileData;
      }
    }
  }
  return fileData;
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL loadSavedGameData(const void *data, int dataSize)
{
  return QSPOpenSavedGameFromData(data, dataSize, QSP_FALSE);
}

/* exec code */
EMSCRIPTEN_KEEPALIVE
QSP_BOOL execString(QSP_CHAR *s)
{
  return QSPExecString(qspStringFromC(s), QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL execCounter()
{
  return QSPExecCounter(QSP_TRUE);
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL execUserInput(QSP_CHAR *s)
{
  QSPSetInputStrText(qspStringFromC(s));
  return QSPExecUserInput(QSP_TRUE);
}

/* Errors */
EMSCRIPTEN_KEEPALIVE
void getLastErrorData(int *errorNum, QSPString *errorLoc, int *errorActIndex, int *errorLine)
{
  return QSPGetLastErrorData(errorNum, errorLoc, errorActIndex, errorLine);
}

EMSCRIPTEN_KEEPALIVE
QSPString getErrorDesc(int errorNum)
{
  return QSPGetErrorDesc(errorNum);
}

EMSCRIPTEN_KEEPALIVE
void getVarStringValue(QSP_CHAR *name, int ind, QSPString *strVal)
{
  int numVal;

  if (QSPGetVarValues(qspStringFromC(name), ind, &numVal, strVal))
  {
    *strVal = qspNullString;
  }
}

EMSCRIPTEN_KEEPALIVE
int getVarNumValue(QSP_CHAR *name, int ind)
{
  QSPString strVal;
  int numVal = 0;

  if (QSPGetVarValues(qspStringFromC(name), ind, &numVal, &strVal))
  {
    return numVal;
  }
  return 0;
}

/* callbacks */
EMSCRIPTEN_KEEPALIVE
void initCallBacks()
{
  qspInitCallBacks();
}

EMSCRIPTEN_KEEPALIVE
void setCallBack(int type, QSP_CALLBACK func)
{
  qspSetCallBack(type, func);
}

/* Struct utils */
EMSCRIPTEN_KEEPALIVE
void createItemsList(QSPListItem **items)
{
  QSPListItem *pitems = (QSPListItem *)malloc(MAX_LIST_ITEMS * sizeof(QSPListItem));
  *items = pitems;
}

EMSCRIPTEN_KEEPALIVE
void freeItemsList(QSPListItem *items)
{
  free(items);
}

EMSCRIPTEN_KEEPALIVE
void freeSaveBuffer(void *buffer)
{
  free(buffer);
}
