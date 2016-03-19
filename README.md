# stashdb

A REST based data store that syncs

## Features

 - Supports PUT and GET of REST resources ("files") of any content type.
 - Stores everything in RAM for fast access.
 - Stores differential history to enable syncing of collections.

## Basics

### /some/resource

If you `PUT /some/resource`, stashdb will store the resouce you have provided and return it verbatim on any subsequent `GET` with the same path.

### /some/collection/

If you `PUT /some/collection/resource`, the collection /some/collection is created automatically for you (and all intermediary collection).

After this, you can iterate on all resources in the collection like this:

    GET /some/collection/?get

This will fetch the first resource from the collection and return a `next` link to the next available resource.

Specifically, following the `next` link can return the following:

 - The `Name` header has been set
   - HTTP 200: Resource available: the resource with the provided name is returned.
   - HTTP 204: Resource gone: the resource with the provided name has been deleted.
 - The `Name` header is missing
   - HTTP 204: No more resources: there is no more resources in this collection.

In all three cases above, the service will always return a `next` link. In the case where there is no more resources, following the `next` link may return a new resource that was added since the request to the server that returned the link. 

![Build status](https://travis-ci.org/Solfisk/stashdb.svg?branch=master)
