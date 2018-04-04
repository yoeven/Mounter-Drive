import IconTypes from "../data/IconTypes.json";

export function formatBytes(a, b) { if (0 === a) return "0 Bytes"; var c = 1024, d = b || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c)); return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f] }



export function handleKeyPress(e,keyToCheck,functionToRun)
{
    if (e.key === keyToCheck) {
        functionToRun();
    }
}

export function handleFocusHighlight(e,min=null,max=null) {
    if(min == null||max== null)
    {
        e.target.select();
    }
    else
    {
        e.target.setSelectionRange(min,max);
    }
}

export function getFileExtension(fileName)
{
    var ext = fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);
    return ext;
}

export function getFileIcon(ext)
{
    if (ext === "") return IconTypes.Icon_Default;
    var extensions = IconTypes.Extensions;
    for (var i = 0; i < extensions.length; i++) 
    {
        if(extensions[i].Ext.includes(ext))
        {
            return extensions[i].Icon;
        }
    }
    return IconTypes.Icon_Default;
}