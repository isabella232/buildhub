import React, { Component } from 'react';
import './App.css';

import {
    SearchBox,
    NoHits,
    Hits,
    HitsStats,
    ItemCheckboxList,
    SortingSelector,
    SelectedFilters,
    MenuFilter,
    Pagination,
    RefinementListFilter,
    ResetFilters,
    SearchkitManager,
    SearchkitProvider,
    Tabs,
    } from "searchkit";

import {
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar
} from "searchkit"

const searchkit = new SearchkitManager("https://kinto-ota.dev.mozaws.net/v1/buckets/build-hub/collections/releases/", {searchUrlPath: "search"})


const HitsTable = ({hits}) => {
  return (
    <div style={{width: '100%', boxSizing: 'border-box', padding: 8}}>
      <table className="sk-table sk-table-striped" style={{width: '100%', boxSizing: 'border-box'}}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Tree</th>
            <th>Revision</th>
            <th>Version</th>
            <th>Platform</th>
            <th>Channel</th>
            <th>Locale</th>
            <th>URL</th>
            <th>Mimetype</th>
            <th>Size</th>
            <th>Published on</th>
            <th>Build ID</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {hits.map(hit => {
            const revisionUrl = (hit._source.source.revision)
              ? (<a href={(hit._source.source.repository + '/rev/' + hit._source.source.revision)}>{hit._source.source.revision}</a>)
              : "";
            const filename = hit._source.download.url.split("/").reverse()[0];
            return (
              <tr key={hit._id}>
                <td>{hit._source.source.product}</td>
                <td>{hit._source.source.tree}</td>
                <td>{revisionUrl}</td>
                <td>{hit._source.target.version}</td>
                <td>{hit._source.target.platform}</td>
                <td>{hit._source.target.channel}</td>
                <td>{hit._source.target.locale}</td>
                <td><a href={hit._source.download.url}>{filename}</a></td>
                <td>{hit._source.download.mimetype}</td>
                <td>{hit._source.download.size}</td>
                <td>{hit._source.download.date}</td>
                <td>{hit._source.build && hit._source.build.id}</td>
                <td>{hit._source.build && hit._source.build.date}</td>
              </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};


class App extends Component {
  render() {
    return (
      <div className="App">
        <SearchkitProvider searchkit={searchkit}>
          <Layout>

            <TopBar>
              <SearchBox
              autofocus={true}
              searchOnChange={true}
              queryFields={["build.id"]}/>
            </TopBar>

            <LayoutBody>
              <SideBar>
                <RefinementListFilter field="target.version"
                            title="Version"
                            id="versions"
                            listComponent={ItemCheckboxList}
                            size={10}
                            operator="OR"
                            translations={{"All":"All versions"}}/>
                <RefinementListFilter field="target.platform"
                            title="Platform"
                            id="platform"
                            size={10}
                            operator="OR"
                            listComponent={ItemCheckboxList}
                            translations={{"All":"All platforms"}}/>
                <RefinementListFilter field="target.channel"
                            title="Channel"
                            id="channel"
                            size={10}
                            operator="OR"
                            listComponent={ItemCheckboxList}
                            translations={{"All":"All channels"}}/>
                <RefinementListFilter field="target.locale"
                            title="Locale"
                            id="locale"
                            listComponent={ItemCheckboxList}
                            size={10}
                            operator="OR"
                            translations={{"All":"All locales"}}/>
              </SideBar>

              <LayoutResults>

                <ActionBar>
                  <ActionBarRow>
                    <HitsStats/>
                    <SortingSelector options={[
                      {label: "Latest Releases", field:"download.date", order: "desc", defaultOption: true},
                      {label: "Relevance", field: "_score", order: "desc"},
                    ]}/>
                  </ActionBarRow>

                  <ActionBarRow>
                    <SelectedFilters/>
                    <ResetFilters/>
                  </ActionBarRow>

                  <MenuFilter field="source.product"
                              title="Product"
                              id="products"
                              listComponent={Tabs}
                              translations={{"All":"All products"}}/>
                </ActionBar>

                <Hits hitsPerPage={30} listComponent={HitsTable}/>
                <NoHits translations={{
                  "NoHits.NoResultsFound":"No release found were found for {query}",
                  "NoHits.DidYouMean":"Search for {suggestion}",
                  "NoHits.SearchWithoutFilters":"Search for {query} without filters"}} suggestionsField="target.version"/>

                <Pagination showNumbers={true}/>

               </LayoutResults>
            </LayoutBody>
          </Layout>
        </SearchkitProvider>
      </div>
    );
  }
}

export default App;
