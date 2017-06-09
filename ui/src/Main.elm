module Main exposing (..)

import ElasticSearch
import Model exposing (..)
import Navigation exposing (..)
import Types exposing (..)
import Url exposing (..)
import View exposing (..)


main : Program Never Model Msg
main =
    Navigation.program
        UrlChange
        { init = init
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }


updateFilters : NewFilter -> Filters -> Filters
updateFilters newFilter filters =
    case newFilter of
        ClearAll ->
            initFilters

        NewProductFilter value ->
            { filters | product = value }

        NewVersionFilter value ->
            { filters | version = value }

        NewPlatformFilter value ->
            { filters | platform = value }

        NewChannelFilter value ->
            { filters | channel = value }

        NewLocaleFilter value ->
            { filters | locale = value }

        NewBuildIdSearch value ->
            { filters | buildId = value }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ filters, settings } as model) =
    case msg of
        FacetsReceived (Ok facets) ->
            { model | facets = Just <| ElasticSearch.processFacets facets } ! []

        FacetsReceived (Err error) ->
            { model | error = Just (toString error) } ! []

        LoadNextPage ->
            { model | page = model.page + 1 }
                ! [ getFilterFacets filters settings.pageSize (model.page + 1) ]

        LoadPreviousPage ->
            { model | page = model.page - 1 }
                ! [ getFilterFacets filters settings.pageSize (model.page - 1) ]

        UpdateFilter newFilter ->
            let
                updatedFilters =
                    updateFilters newFilter filters

                updatedRoute =
                    routeFromFilters updatedFilters
            in
                { model | filters = updatedFilters, page = 1 }
                    ! [ newUrl <| urlFromRoute updatedRoute ]

        UrlChange location ->
            let
                updatedModel =
                    routeFromUrl model location
            in
                { updatedModel | error = Nothing, page = updatedModel.page }
                    ! [ getFilterFacets updatedModel.filters settings.pageSize updatedModel.page ]

        DismissError ->
            { model | error = Nothing } ! []

        NewPageSize sizeStr ->
            let
                newPageSize =
                    Result.withDefault 100 <| String.toInt sizeStr
            in
                { model | settings = { settings | pageSize = newPageSize }, page = 1 }
                    ! [ getFilterFacets model.filters newPageSize 1 ]
