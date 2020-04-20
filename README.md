# InfCo

Another take on infrastructure as code.

# Transforms
When the task file is read, transforms get replaced by values depending on their type.
Transforms are resolved recursively.

## Decrypt
The decrypt transform decrypts an encrypted value using the salt, initialization vector, and cipher and hash algorithms given.

*Options*
  * salt (hex-encoded bytes)
  * iv (hex-encoded bytes)
  * cipherAlgorithm (string)
  * hashAlgorithm (string)
  * value (hex-encoded bytes)

```JSON
{
  "transform":"decrypt",
  "salt":"3748a5b3f1",
  "iv":"3748a5b3f1",
  "cipherAlgorithm":"AES-256-CFB",
  "hashAlgorithm":"sha256",
  "value":"3748a5b3f1"
}
```
To make it easier to obtain the appropriate JSON string, InfCo can be run with the command "encrypt" and the value to be encrypted. It will prompt for a password and then output the serialized JSON.
```shell
infco encrypt someValue
```

## FileContents
This transformation provides the contents of a local file as string or buffer.

*Options*
  * path
  * format ("string", "buffer")

```JSON
{"transform": "fileContents", "path": "/tmp/myFile.txt", "format": "buffer"}
```

## Template
Template transforms accept a Mustache template and fill the template with the registered variables.

*Options*
  * template (a template string)

```JSON
{"transform": "template", "template": "VAR={{var1}}"}
```

## UtcTimestamp
The UTC timestamp transform provides a timestamp.

*Options*
  * format ("ISO" (default))
  * part ("full" (default), "date")

```JSON
{"transform": "utcTimestamp", "part": "date"}
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
## TaskFileFromTemplate
Should be able to be simplified or removed, now that the template transform is available.
## Docker Container
To avoid listing all possible options, the configuration could just be defined in the form the API expects.
## Exec
Allow arrays of commands.
