import createWebDAVfs from "webdav";
import {
    getEmitter
} from '../processors/EventEmitterManager';
import progress from "request-progress";
import {ChoiceAlert} from '../components/AlretManager/AlertManager';
import {getFileExtension} from "./generic";
import { setTimeout } from "timers";
const emitter = getEmitter();

const electronremote = window.require("electron").remote;
const {
dialog} = electronremote;
const fs = electronremote.require('fs');


const request = electronremote.require('request');



var endPoint = "";
var wfs = null;


export async function Login(endpoint,username="",password="")
{
    if(username!=="" & password!=="")
    {
        wfs = createWebDAVfs(endpoint,username,password);
    }
    else
    {
        wfs = createWebDAVfs(endpoint);
    }

    if(wfs!=null)
    {
        var contents =null;
        try {
            contents = await wfs.getDirectoryContents("/");
        } catch (error) {
            contents = null;
        }
        
        if(contents!=null)
        {
            endPoint = endpoint;
            return true;
        }
        else
        {
            wfs = null;
        }
    }
    return false;
}




var copyFileName = "";
var pasteFileName = "";
var copyDir = null;
var cut = false;

function ResetDirMovementValues() {
    cut = false;
    copyDir = null;
    copyFileName = "";
    pasteFileName ="";
}


export function getEndPoint() {
    return endPoint;
}

export function getWFS() {
    return wfs;
}

export function IsCopyData() {
    if (copyDir != null) {
        console.log("there is something");
        return true;
    } else {
        return false;
    }
}


export function Cut(DirToCopy, FileName) {
    console.log("Cutting");
    copyDir = DirToCopy;
    copyFileName = FileName
    pasteFileName = FileName;
    cut = true;
    console.log("Cut");
}

export function Copy(DirToCopy, FileName) {
    console.log("Copying");
    copyDir = DirToCopy;
    copyFileName = FileName;
    pasteFileName = FileName;
    cut = false;
    console.log("Copied");
}

let RenderDetails = {
    Title:"Same file name",
    Message:"What would you like to do?",
    Icon:"copy",
    Button1Text:"Keep Both",
    Button2Text:"Overwrite",
}

export async function Paste(DirToPaste) {
    if (copyDir != null) 
    {
            var cDir = null;
            try {
                cDir = await wfs.getDirectoryContents(DirToPaste + "/" + pasteFileName + "/");
            }
            catch (err) {
                cDir = null;
            }

            if (cDir != null) {
                ChoiceAlert(RenderDetails,
                    () => {
                        var fileNameExt = getFileExtension(pasteFileName);
                        if(fileNameExt!=="")
                        {
                            var justNameEndIndex = (pasteFileName.length-fileNameExt.length)-1;
                            pasteFileName = pasteFileName.slice(0, justNameEndIndex) + "(Copied)" + pasteFileName.slice(justNameEndIndex, pasteFileName.length)
                        }
                        else
                        {
                            pasteFileName = pasteFileName + "(Copied)";
                        }
                        RunPaste(DirToPaste);
                    }
                    , () => {
                        if (copyDir !== DirToPaste) {
                            RunPaste(DirToPaste);
                        }                    
                    })
            }
            else {
                RunPaste(DirToPaste);
            }

    }
}

function RunPaste(DirToPaste)
{
    if (cut === true) {
        wfs.moveFile(copyDir + "/" + copyFileName, DirToPaste + "/" + pasteFileName+"/").then(() => {
            ResetDirMovementValues();
            emitter.emit("RefreshCurrectDirectory");
            console.log("Moved");
        });
    } else {
        console.log("Pasting");
        wfs.copyFile(copyDir + "/" + copyFileName, DirToPaste + "/" + pasteFileName+"/").then(() => {
            emitter.emit("RefreshCurrectDirectory");
            console.log("Paste");
        });
    }
}

export function Delete(DirToDelete) {
    wfs.deleteFile(DirToDelete).then(() => {
        console.log("Deleted");
        emitter.emit("RefreshCurrectDirectory");
    })
}

export function Download(RemoteDirToDownload, filename,progressUpdateFunction) {
    var userChosenPath = dialog.showSaveDialog({
        title: "Select download location for file",
        defaultPath: filename,
        properties: ['openDirectory'],
    });

    if (userChosenPath == null)
    {
        progressUpdateFunction("Canceled");
        return null;
    }

    var Aborted = false;

    var link = wfs.getFileDownloadLink(RemoteDirToDownload);
    var r = request(link)
    progress(r, {})
        .on('progress', function (state) {
            progressUpdateFunction(state.percent * 100);
        })
        .on('error', function (err) {
            progressUpdateFunction("Error");
        })
        .on('end', function () {
            if(!Aborted)
            {
                progressUpdateFunction("Done");
            }
        })
        .pipe(fs.createWriteStream(userChosenPath));


    var con ={
        req: ()=>{
            Aborted = true;
            r.abort();
            fs.unlink(userChosenPath, (err) => {
                if (err) throw err;
                console.log("Deleted locally");
            });
        },
        downloadpath:userChosenPath,
    }
    return con;
}


export async function Upload(RemoteDirToUploadTo,filename,filesize,LocalDirFile,progressUpdateFunction) 
{
    console.log("Uploading")
    var cDir = null;
    try {
        cDir = await wfs.getDirectoryContents(RemoteDirToUploadTo + "/" + filename + "/");
    }
    catch (err) {
        cDir = null;
    }

    if(cDir!==null)
    {
        var fileNameExt = getFileExtension(filename);
        if(fileNameExt!=="")
        {
            var justNameEndIndex = (filename.length-fileNameExt.length)-1;
            filename = filename.slice(0, justNameEndIndex) + "(newly uploaded)" + filename.slice(justNameEndIndex, filename.length)
        }
        else
        {
            filename+="(newly uploaded)";
        }
    }

    var link = wfs.getFileUploadLink(RemoteDirToUploadTo + "/" + filename);
    var data = fs.createReadStream(LocalDirFile);
    var Aborted = false;
    var options = {
        url: link,
        body: data,
    };
    var r =  request.put(options);
    progress(r, {})
        .on('error', function (err) {
            progressUpdateFunction("Error");
        })
        .on('end', function () {
            if(!Aborted)
            {
                progressUpdateFunction("Done");
                emitter.emit("RefreshCurrectDirectory");
                console.log("Uploaded");
            }

        });

    var amountdone = 0;
    data.on('data', function (data) {
        amountdone += data.length;
        progressUpdateFunction((amountdone / filesize) * 100);
    })
    
    return ()=>{
        Aborted = true;
        r.abort();
        setTimeout(()=>{
            Delete(RemoteDirToUploadTo + "/" + filename+"/");
        },3000)
    };
}

export async function CreateTextFile(dir,filename,content)
{
    var cDir = null;
    try {
        cDir = await wfs.getDirectoryContents(dir + "/" + filename + ".txt/");
    }
    catch (err) {
        cDir = null;
    }

    if(cDir!==null)
    {
        filename+="(new)";
    }

    wfs.putFileContents(dir+"/"+filename+".txt",content, { format: "text" }).then(()=>{
        emitter.emit("RefreshCurrectDirectory");
    });
}

export async function CreateFolder(dir,filename)
{
    var cDir = null;
    try {
        cDir = await wfs.getDirectoryContents(dir + "/" + filename + "/");
    }
    catch (err) {
        cDir = null;
    }

    if(cDir!==null)
    {
        filename+="(new)";
    }

    wfs.createDirectory(dir+"/"+filename).then(()=>{
        emitter.emit("RefreshCurrectDirectory");
    });
}
