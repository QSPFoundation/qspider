
#include <wchar.h>
#include "emscripten.h"

typedef wchar_t QSP_CHAR;
typedef int (*QSP_CALLBACK)();

#include "../../qsp/qsp/bindings/qsp.h"

#include "../../qsp/qsp/callbacks.h"
#include "../../qsp/qsp/text.h"

typedef struct
{
  QSP_CHAR *Name;
  QSP_CHAR *Image;
} QSPListItemC;

EMSCRIPTEN_KEEPALIVE
void qspInitCallBacks()
{
  int i;
  qspIsInCallBack = QSP_FALSE;
  qspIsDisableCodeExec = QSP_FALSE;
  qspIsExitOnError = QSP_FALSE;
  for (i = 0; i < QSP_CALL_DUMMY; ++i)
    qspCallBacks[i] = 0;
}

EMSCRIPTEN_KEEPALIVE
void qspSetCallBack(int type, QSP_CALLBACK func)
{
  qspCallBacks[type] = func;
}

void qspCallDebug(QSPString str)
{
  printf("qspCallDebug\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_DEBUG])
  {
    qspSaveCallState(&state, QSP_FALSE, QSP_FALSE);
    qspCallBacks[QSP_CALL_DEBUG](qspStringToC(str));
    qspRestoreCallState(&state);
  }
}

void qspCallSetTimer(int msecs)
{
  printf("qspCallSetTimer\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SETTIMER])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SETTIMER](msecs);
    qspRestoreCallState(&state);
  }
}

void qspCallRefreshInt(QSP_BOOL isRedraw)
{
  printf("qspCallRefreshInt\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_REFRESHINT])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_REFRESHINT](isRedraw);
    qspRestoreCallState(&state);
  }
}

void qspCallSetInputStrText(QSPString text)
{
  printf("qspCallSetInputStrText\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SETINPUTSTRTEXT])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SETINPUTSTRTEXT](qspStringToC(text));
    qspRestoreCallState(&state);
  }
}

void qspCallSystem(QSPString cmd)
{
  printf("qspCallSystem\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SYSTEM])
  {
    qspSaveCallState(&state, QSP_FALSE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SYSTEM](cmd);
    qspRestoreCallState(&state);
  }
}

void qspCallOpenGame(QSPString file, QSP_BOOL isNewGame)
{
  printf("qspCallOpenGame\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_OPENGAME])
  {
    qspSaveCallState(&state, QSP_FALSE, QSP_FALSE);
    qspCallBacks[QSP_CALL_OPENGAME](qspStringToC(file), isNewGame);
    qspRestoreCallState(&state);
  }
}

void qspCallOpenGameStatus(QSPString file)
{
  printf("qspCallOpenGameStatus\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_OPENGAMESTATUS])
  {
    qspSaveCallState(&state, QSP_FALSE, QSP_TRUE);
    qspCallBacks[QSP_CALL_OPENGAMESTATUS](qspStringToC(file));
    qspRestoreCallState(&state);
  }
}

void qspCallSaveGameStatus(QSPString file)
{
  printf("qspCallSaveGameStatus\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SAVEGAMESTATUS])
  {
    qspSaveCallState(&state, QSP_FALSE, QSP_TRUE);
    qspCallBacks[QSP_CALL_SAVEGAMESTATUS](qspStringToC(file));
    qspRestoreCallState(&state);
  }
}

void qspCallShowMessage(QSPString text)
{
  printf("qspCallShowMessage\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SHOWMSGSTR])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SHOWMSGSTR](qspStringToC(text));
    qspRestoreCallState(&state);
  }
}

int qspCallShowMenu(QSPListItem *list, int count)
{
  printf("qspCallShowMenu\n");
  QSPCallState state;
  int index;
  if (qspCallBacks[QSP_CALL_SHOWMENU])
  {
    QSPListItemC *items = (QSPListItemC *)malloc(count * sizeof(QSPListItemC));
    for (int i = 0; i < count; ++i)
    {
      items[i].Name = qspStringToC(list[i].Name);
      items[i].Image = qspStringToC(list[i].Image);
    }
    qspSaveCallState(&state, QSP_FALSE, QSP_TRUE);
    index = qspCallBacks[QSP_CALL_SHOWMENU](items, count);
    free(items);
    qspRestoreCallState(&state);
    return index;
  }
  return -1;
}

void qspCallShowPicture(QSPString file)
{
  printf("qspCallShowPicture\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SHOWIMAGE])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SHOWIMAGE](qspStringToC(file));
    qspRestoreCallState(&state);
  }
}

void qspCallShowWindow(int type, QSP_BOOL isShow)
{
  printf("qspCallShowWindow\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SHOWWINDOW])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SHOWWINDOW](type, isShow);
    qspRestoreCallState(&state);
  }
}

void qspCallPlayFile(QSPString file, int volume)
{
  printf("qspCallPlayFile\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_PLAYFILE])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_PLAYFILE](file, volume);
    qspRestoreCallState(&state);
  }
}

QSP_BOOL qspCallIsPlayingFile(QSPString file)
{
  printf("qspCallIsPlayingFile\n");
  QSPCallState state;
  QSP_BOOL isPlaying;
  if (qspCallBacks[QSP_CALL_ISPLAYINGFILE])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    isPlaying = (QSP_BOOL)qspCallBacks[QSP_CALL_ISPLAYINGFILE](file);
    qspRestoreCallState(&state);
    return isPlaying;
  }
  return QSP_FALSE;
}

void qspCallSleep(int msecs)
{
  printf("qspCallSleep\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_SLEEP])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_SLEEP](msecs);
    qspRestoreCallState(&state);
  }
}

int qspCallGetMSCount()
{
  printf("qspCallGetMSCount\n");
  QSPCallState state;
  int count;
  if (qspCallBacks[QSP_CALL_GETMSCOUNT])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    count = qspCallBacks[QSP_CALL_GETMSCOUNT]();
    qspRestoreCallState(&state);
    return count;
  }
  return 0;
}

void qspCallCloseFile(QSPString file)
{
  printf("qspCallCloseFile\n");
  QSPCallState state;
  if (qspCallBacks[QSP_CALL_CLOSEFILE])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    qspCallBacks[QSP_CALL_CLOSEFILE](file);
    qspRestoreCallState(&state);
  }
}

QSPString qspCallInputBox(QSPString text)
{
  printf("qspCallInputBox\n");
  QSPCallState state;
  QSP_CHAR *buffer;
  int maxLen = 511;
  if (qspCallBacks[QSP_CALL_INPUTBOX])
  {
    qspSaveCallState(&state, QSP_TRUE, QSP_FALSE);
    /* Prepare input buffer */
    buffer = (QSP_CHAR *)malloc((maxLen + 1) * sizeof(QSP_CHAR));
    *buffer = 0;
    /* Process input */
    qspCallBacks[QSP_CALL_INPUTBOX](qspStringToC(text), buffer, maxLen);
    buffer[maxLen] = 0;
    /* Clean up */
    qspRestoreCallState(&state);
    return qspStringFromC(buffer);
  }
  return qspNewEmptyString();
}
