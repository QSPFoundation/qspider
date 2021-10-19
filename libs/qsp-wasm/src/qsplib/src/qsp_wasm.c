#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#define QSP_BINDING
#define _UNICODE

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

QSP_CALLBACK errorCallback;

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
void getVersion(QSPString *result)
{
  *result = QSPGetVersion();
}

EMSCRIPTEN_KEEPALIVE
void setErrorCallback(QSP_CALLBACK func)
{
  errorCallback = func;
}

void onError()
{
  if (errorCallback)
  {
    errorCallback();
  }
}

/* Main desc */
EMSCRIPTEN_KEEPALIVE
void getMainDesc(QSPString *result)
{
  *result = QSPGetMainDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isMainDescChanged()
{
  return QSPIsMainDescChanged();
}

/* Vars desc */
EMSCRIPTEN_KEEPALIVE
void getVarsDesc(QSPString *result)
{
  *result = QSPGetVarsDesc();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isVarsDescChanged()
{
  return QSPIsVarsDescChanged();
}

/* Actions */
EMSCRIPTEN_KEEPALIVE
QSPListItem *getActions(int *count)
{
  *count = qspCurActionsCount;
  QSPListItem *items = (QSPListItem *)malloc(qspCurActionsCount * sizeof(QSPListItem));
  int i;
  for (i = 0; i < qspCurActionsCount; ++i)
  {
    items[i].Name = qspCurActions[i].Desc;
    items[i].Image = qspCurActions[i].Image;
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
void selectAction(int index)
{
  if (!QSPSetSelActionIndex(index, QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void executeSelAction()
{
  if (!QSPExecuteSelActionCode(QSP_TRUE))
    onError();
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isActionsChanged()
{
  return QSPIsActionsChanged();
}

/* Objects */
EMSCRIPTEN_KEEPALIVE
QSPListItem *getObjects(int *count)
{
  *count = qspCurObjectsCount;
  int i;
  QSPListItem *items = (QSPListItem *)malloc(qspCurObjectsCount * sizeof(QSPListItem));
  for (i = 0; i < qspCurObjectsCount; ++i)
  {
    items[i].Name = qspCurObjects[i].Desc;
    items[i].Image = qspCurObjects[i].Image;
  }
  return items;
}

EMSCRIPTEN_KEEPALIVE
void selectObject(int index)
{
  if (!QSPSetSelObjectIndex(index, QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
QSP_BOOL isObjectsChanged()
{
  return QSPIsObjectsChanged();
}

/* Game */
EMSCRIPTEN_KEEPALIVE
void loadGameData(const void *data, int dataSize, QSP_BOOL isNewGame)
{
  if (!QSPLoadGameWorldFromData(data, dataSize, isNewGame))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void restartGame()
{
  if (!QSPRestartGame(QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void *saveGameData(int *realSize)
{
  *realSize = 0;
  int fileSize = 64 * 1024;
  void *fileData = (void *)malloc(fileSize);
  if (!QSPSaveGameAsData(fileData, &fileSize, QSP_FALSE))
  {
    if (fileSize)
    {
      fileData = (void *)realloc(fileData, fileSize);
      if (!QSPSaveGameAsData(fileData, &fileSize, QSP_FALSE))
      {
        free(fileData);
        return fileData;
      }
    }
  }

  *realSize = fileSize;
  return fileData;
}

EMSCRIPTEN_KEEPALIVE
void loadSavedGameData(const void *data, int dataSize)
{
  if (!QSPOpenSavedGameFromData(data, dataSize, QSP_TRUE))
  {
    onError();
  }
}

/* exec code */
EMSCRIPTEN_KEEPALIVE
void execString(QSP_CHAR *s)
{
  if (!QSPExecString(qspStringFromC(s), QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execCounter()
{
  if (!QSPExecCounter(QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execLoc(QSP_CHAR *name)
{
  if (!QSPExecLocationCode(qspStringFromC(name), QSP_TRUE))
  {
    onError();
  }
}

EMSCRIPTEN_KEEPALIVE
void execUserInput(QSP_CHAR *s)
{
  QSPSetInputStrText(qspStringFromC(s));

  if (!QSPExecUserInput(QSP_TRUE))
  {
    onError();
  }
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

  if (!QSPGetVarValues(qspStringFromC(name), ind, &numVal, strVal))
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
void freeItemsList(QSPListItem *items)
{
  free(items);
}

EMSCRIPTEN_KEEPALIVE
void freeSaveBuffer(void *buffer)
{
  free(buffer);
}