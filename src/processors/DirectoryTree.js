import { getWFS } from "./WebDavManager.js";;

var wfs;


export async function BuildTree(startdir = "", layers = 3) {
    wfs = getWFS();
    var cLayers = layers;
    var DirToSearch = [startdir];
    var AllItems = [];
    while (cLayers > 0) {
        var NewDirToSearch = [];
        for (var j = 0; j < DirToSearch.length; j++) {
            var contents = await wfs.getDirectoryContents(DirToSearch[j]);
            for (var i = 0; i < contents.length; i++) {
                let copy = {
                    ItemName: null,
                    ItemDest: null,
                    ParentDest: null,
                    IsFile:false,
                }
                copy.ItemName = contents[i].basename;
                copy.ItemDest = contents[i].filename;
                copy.ParentDest = DirToSearch[j];
                copy.IsFile = contents[i].type === "directory" ? false : true;
                AllItems.push(copy);
                if (contents[i].type === "directory") {
                    NewDirToSearch.push(contents[i].filename);
                }
            }
        }
        DirToSearch = NewDirToSearch;
        cLayers--;
    }
    let ReturnData = {
        DirStartingPos:startdir,
        data:AllItems
    }
    return ReturnData;
}