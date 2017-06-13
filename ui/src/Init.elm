module Init exposing (..)

import ElasticSearch
import Http
import Navigation exposing (..)
import Types exposing (..)
import Url exposing (..)


initFilters : Filters
initFilters =
    { product = "all"
    , version = "all"
    , platform = "all"
    , channel = "all"
    , locale = "all"
    , buildId = ""
    , page = 1
    }


init : Location -> ( Model, Cmd Msg )
init location =
    let
        defaultSettings =
            { pageSize = 100 }

        defaultModel =
            { filters = initFilters
            , facets = Nothing
            , route = MainView
            , error = Nothing
            , settings = defaultSettings
            }

        updatedModel =
            routeFromUrl defaultModel location
    in
        updatedModel
            ! [ ElasticSearch.getFacets updatedModel.filters defaultSettings.pageSize
                    |> Http.send FacetsReceived
              ]