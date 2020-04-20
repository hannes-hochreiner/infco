# InfCo

Another take on infrastructure as code.

# Transforms
When the task file is read, transforms get replaced by values depending on their type.
Transforms are resolved recursively.

## Template
Template transforms accept a Mustache template and fill the template with the registered variables.
```JSON
{"transform": "template", "template": "VAR={{var1}}"}
```

# Tasks

## Docker Container
```JSON
{
  "type": "dockerContainer",
  "title": "create and start container",
  "config": {
    "containerName": "test",
    "actions": [
      {"action": "create", "data": {
        "Image": "couchdb",
        "Env": [
          {"valueTransform": "fillTemplate", "template": "COUCHDB_USER={{user}}", "data": }
        ],
        "HostConfig": {
          "RestartPolicy": {"Name": "on-failure", "MaximumRetryCount": 10},
          "Binds": [
            "/opt/bookmark/couchdb/data:/opt/couchdb/data:z",
            "/opt/bookmark/couchdb/config:/opt/couchdb/etc/local.d:z"
          ]
        }
      }},
      {"action": "start"}
    ]
    "image": "couchdb",
    "volumes": [
      "/opt/bookmark/couchdb/data:/opt/couchdb/data:z",
      "/opt/bookmark/couchdb/config:/opt/couchdb/etc/local.d:z"
    ],
    "env": {
      "COUCHDB_USER": {"valueTransform":"var", "name":"couchDbUsername"},
      "COUCHDB_PASSWORD": {"valueTransform":"var", "name":"couchDbPassword"}
    }
  }
}
```

# TODOs
## Templates
The transformation "fillTemplate" can replace the transformation "prefix/suffix" as well as simplify the task "fileFromTemplate".
## Docker Container
To avoid listing all possible options, the configuration could just be defined in the form the API expects.
## Exec
Allow arrays of commands.
