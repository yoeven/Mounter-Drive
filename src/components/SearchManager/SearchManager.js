import React from "react";
import { Input, Dropdown, Table,Card } from 'semantic-ui-react';
import {GetCurrentDirectoryPos} from "../FileList";
import { BuildTree } from "../../processors/DirectoryTree";
import SearchResultHolder from "./SearchResultHolder";
import * as JsSearch from 'js-search';

import "../../css/general.css";


var searchProcess;

function setSearchProcess(data)
{
    searchProcess = new JsSearch.Search('ItemDest');
    searchProcess.searchIndex = new JsSearch.UnorderedSearchIndex();
    //searchProcess.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    searchProcess.addIndex('ItemName');
    searchProcess.addDocuments(data);
}

class SearchManager extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            SearchData: null,
            SeacrhDataStartPoint: null,

            SerachInput: "",
            Loading: false,
            GettingSearchData: false,
            SearchResults: [],

            dropdownopen: false,
        }
    }

    checkToProcess()
    {
        var CD = GetCurrentDirectoryPos();
        if(this.state.GettingSearchData)
        {
            if(this.state.SeacrhDataStartPoint !== CD)
            {
                this.processTree(CD);
            }
        }
        else
        {
            if(this.state.SearchData===null)
            {
                this.processTree(CD);
            }
            else
            {
                if(this.state.SearchData.DirStartingPos!==CD)
                {
                    this.processTree(CD);
                }
            }
        }
    }

    async processTree(CD) {
        await this.setState({ GettingSearchData: true, SearchData: null, SeacrhDataStartPoint: CD,SearchResults:[] });
        console.log("Building Tree");
        BuildTree(CD, 2).then((content) => {
            if (this.state.SeacrhDataStartPoint === content.DirStartingPos) {
                console.log("Built Tree");
                this.setState({ SearchData: content, GettingSearchData: false });
                setSearchProcess(content.data);
                this.search(this.state.SerachInput);
            }
        });
    }

    async search(keyword) {
        var SearchResults = [];
        await this.setState({ SearchResults: [], Loading: true, SerachInput: keyword });
        if (!this.state.GettingSearchData && this.state.SearchData !== null
            && keyword!=="") 
        {
            SearchResults = searchProcess.search(keyword);
            //SearchResults = this.state.SearchData.data.filter(data => data.ItemDest.toLowerCase().includes(keyword.toLowerCase()));
        }
        await this.setState({ SearchResults: SearchResults, Loading: this.state.GettingSearchData});
    }

    render() {
        return (
            <Dropdown
                open={this.state.Loading === false && 
                this.state.dropdownopen && 
                this.state.SearchData!==null&&
                this.state.SerachInput!==""}
                icon={null}
                scrolling
                trigger={
                    <Input 
                        icon="search"
                        placeholder="Search"
                        value={this.state.SerachInput}
                        loading={this.state.Loading}
                        onChange={(event, data) => this.search(data.value)}
                        onKeyPress ={(event)=>{if(event.key==="Enter") {this.search(this.state.SerachInput)} }}
                        onClick={()=>this.setState({dropdownopen:true})}
                        onFocus={()=>this.checkToProcess()}
                    />
                }
                onBlur={() => this.setState({ dropdownopen: false })} 
                floating>
                <Dropdown.Menu onClick={()=>this.setState({dropdownopen:false,SerachInput:""})} >
                    {this.state.SearchResults.length > 0 &&
                        <div className="searchResultBox">
                            <Table>
                                <Table.Body>
                                    {this.state.SearchResults.map(item =>
                                        <SearchResultHolder key={item.ItemDest} filedata={item} />
                                    )}
                                </Table.Body>
                            </Table>
                        </div>
                    }

                    {this.state.SearchResults.length <= 0 && this.state.SearchData !== null &&
                        <Card>
                            <Card.Content extra>
                                <Card.Header >
                                    No results found.
                                </Card.Header>
                            </Card.Content>
                        </Card>
                    }
             
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default SearchManager;