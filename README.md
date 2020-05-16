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

## Exec
Executes a command or a series of commands.

*config*
  * command (string | array of string)

```JSON
{
  "type": "exec",
  "title": "create a directory",
  "config": {
    "command": [
      "mkdir /tmp/test",
      "touch /tmp/test/test.txt"
    ]
  }
}
```

## Request
This task executes a network request.
In the current implementation all options understood by axios should work.

*config*
  * host (string)
  * port (number)
  * socketPath (string)
  * url (string)
  * method (string): e.g. "get", "put", "post", "delete"
  * ...

Either "host" and "port", or "socketPath" have to be specified.

```JSON
{
  "type": "request",
  "title": "get page",
  "config": {
    "protocol": "http",
    "host": "127.0.0.1",
    "port": 80,
    "method": "get",
    "url": "/",
  }
}
```

## File from String
Creates a file from with the contents of a string.

*config*
  * filename (string)
  * string (string)

```JSON
{
  "type": "fileFromString",
  "title": "create a file from a string",
  "config": {
    "filename": "/tmp/test.txt",
    "string": "test string"
  }
}
```

## Line in File
This task checks whether a line is in a file.
If the line is not in the file, it is added as the last line.

*config*
  * filename (string)
  * line (string)

```JSON
{
  "type": "lineInFile",
  "title": "put a line of text in a file",
  "config": {
    "filename": "/tmp/test.txt",
    "line": "test string"
  }
}
```

## CouchDb
This task creates a CouchDb on an existing database instance.
It also adds the security configuration.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string)
  * urlPrefix (string): prefix to be used, if the database is not at root
  * name (string): name of the database
  * auth (object): authentication object
  * auth.username (string)
  * auth.password (string)
  * security (object)
  * security.admins (object)
  * security.admins.names (array of string): names of admin users
  * security.admins.roles (array of string): roles of admin users
  * security.members (object)
  * security.members.names (array of string): names of members
  * security.members.roles (array of string): roles of members

Either "host" and "port", or "socketPath" need to be specified.
If they are not specified, "127.0.0.1" is used as the default host and 5984 as the default port.

```JSON
{
  "type": "couchDb",
  "title": "creating couchDb",
  "config": {
    "urlPrefix": "/bookmark_couchdb",
    "name": "bookmark",
    "auth": {
      "username": "couchDbUser",
      "password": "couchDbPass"
    },
    "security": {
      "admins": { "names": [], "roles": [ "bookmark_admin" ] },
      "members": { "names": [], "roles": [ "bookmark_read", "bookmark_write" ] }
    }
  }
}
```

## CouchDb Document
This task checks a document in a CouchDb and updated it, if necessary.
Most options are the same as for CouchDb task.
Instead of the "name", "security", and "urlPrefix" options, there is a "url" and a "content" option.

*config*
  * url (string)
  * content (string)

```JSON
{
  "type": "couchDbDocument",
  "title": "checking CouchDb document",
  "config": {
    "method": "get",
    "url": "/url",
    "content": "{\"doc\": \"doc\"}",
    "auth": {
      "username": "couchDbUser",
      "password": "couchDbPass"
    }
  }
}
```

## Transfer
This task transfers a file from the local host to a remote host.

*config*
  * direction (string): either "get" or "put"
  * remotePath (string)
  * localPath (string)

```JSON
{
  "type": "transfer",
  "title": "transferring file",
  "config": {
    "direction": "put",
    "localPath": "/tmp/test.txt",
    "remotePath": "/tmp/test2.txt"
  }
}
```

## Review Backups
This task reviews a directory with backup files and deletes the ones that are no longer needed.
The task expects a directory with files that start with the date in the format "YYYY-MM-DD" and end with the configured suffix.
It then takes the configured dates and sorts the backups into buckets by days past the current date (i.e. bucket 1: today - days[0], days[1] - days[2], days[2] - days[length - 1]).
From each bucket the oldest file is kept.
If "0" is configured, the backup from the current days will be kept.
If the numbers configured in "days" are multiples of the preceding number the number of backups will be equal to the length of the "days" array.
Otherwise, the number of backups can be one less.

*config*
  * path (string): path of the backup files
  * days (array of string)
  * suffix (string): suffix of backup files

```JSON
{
  "type": "reviewBackups",
  "title": "reviewing backups",
  "config": {
    "path": "/backup/",
    "days": [0,1,7,28],
    "suffix": "_mydata.zip"
  }
}
```

## Docker Composter
This task can be used to process [Docker Composter](https://github.com/hannes-hochreiner/docker-composter) configurations.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string, default: "/var/run/docker.sock"): path of a UNIX socket
  * data (JSON object): Docker Composter configuration to process
  * actions (array of strings): array of actions to perform

Either "host" and "port", or "socketPath" need to be provided.
If neither is provided, the default value for "socketPath" is used.
"data" only needs to be provided for the "create" action.
Allowed values for actions are:
  * up (create the containers, networks, and volumes as specified in the Docker Composter configuration)
  * down (remove the containers, networks, and volumes as specified in the Docker Composter configuration)

```JSON
{
  "type": "dockerComposter",
  "title": "create containers, networks, and volumes",
  "config": {
    "data": {
      "networks": {"test1_net": {}},
      "volumes": {},
      "containers": {
        "test1_cont": {
          "config": {
            "Image": "nginx:alpine",
            "NetworkingConfig": {"EndpointsConfig": {"test1_net": {}}}
          }
        }
      }
    },
    "actions": ["up"]
  }
}
```

## Docker Container
This task can be used to administrate docker container.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string, default: "/var/run/docker.sock"): path of a UNIX socket
  * name (string): container name
  * data (JSON object): data to be send with the request to create a container (see Docker API)
  * actions (array of strings): array of actions to perform

Either "host" and "port", or "socketPath" need to be provided.
If neither is provided, the default value for "socketPath" is used.
"data" only needs to be provided for the "create" action.
Allowed values for actions are:
  * create (create the container, if it does not exist)
  * start (starts or restarts the container)
  * stop
  * wait (waits until the container exits)
  * remove (removes a container, if it exists)

```JSON
{
  "type": "dockerContainer",
  "title": "create and start container",
  "config": {
    "name": "test",
    "data": {
      "Image": "couchdb",
      "Env": [
        {"transform": "template", "template": "COUCHDB_USER={{user}}"}
      ],
      "HostConfig": {
        "RestartPolicy": {"Name": "on-failure", "MaximumRetryCount": 10},
        "Binds": [
          "/opt/bookmark/couchdb/data:/opt/couchdb/data:z",
          "/opt/bookmark/couchdb/config:/opt/couchdb/etc/local.d:z"
        ]
      }
    },
    "actions": [
      "create"
      "start"
    ]
  }
}
```

## Docker Image
This task can be used to administrate Docker Images.
Currently, only the action "prune" is supported.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string, default: "/var/run/docker.sock"): path of a UNIX socket
  * actions (array of string)
  * images (array of string): image to be created

Either "host" and "port", or "socketPath" need to be provided.
If neither is provided, the default value for "socketPath" is used.
Allowed values for actions are:
  * prune (remove unused images)
  * create

```JSON
{
  "type": "dockerImage",
  "title": "prune images",
  "config": {
    "actions": [
      "prune"
    ]
  }
}
```

## Docker Network
This task can be used to administrate Docker Networks.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string, default: "/var/run/docker.sock"): path of a UNIX socket
  * networkName (string)
  * containers (array of string)
  * actions (array of string)

Either "host" and "port", or "socketPath" need to be provided.
If neither is provided, the default value for "socketPath" is used.
"containers" is only used for the actions "connect", "update", and "disconnect".
Allowed values for actions are:
  * create (creates a network, if it does not exist)
  * connect (adds the containers given in "containers" to the network)
  * update (adds and removes containers from the network to ensure all containers from "containers" are in the network and only those)
  * disconnect (removes the containers given in "containers" to the network)
  * remove (removes a network, if it exists)
  * prune (removes networks, which are not in use)
```JSON
{
  "type": "dockerNetwork",
  "title": "confirm network",
  "config": {
    "networkName": "couch_test_network",
    "containers": [
      "couch_test"
    ],
    "actions": [
      "create",
      "connect"
    ]
  }
}
```

## Docker Volume
This tasks can be used to administrate Docker volumes.

*config*
  * protocol (string, default: "http")
  * host (string)
  * port (number)
  * socketPath (string, default: "/var/run/docker.sock"): path of a UNIX socket
  * volumeName (string)
  * actions (array of string)

Either "host" and "port", or "socketPath" need to be provided.
If neither is provided, the default value for "socketPath" is used.
Allowed values for actions are:
  * create (creates a volume, if it does not exist)
  * remove (removes a volume, if it exists)
```JSON
{
  "type": "dockerVolume",
  "title": "create volume",
  "config": {
    "volumeName": "couch_test_volume",
    "actions": [
      "create"
    ]
  }
}
```

## Wait
This task can be used to wait for a fixed amount of time.

*config*
  * ms (integer): wait time in milliseconds

```JSON
{
  "type": "wait",
  "title": "wait for some time",
  "config": {
    "ms": 200
  }
}
```


# Complete Examples
## Creating a file on a remove host from a template
Host configuration
```JSON
{
  "hosts": [
    {
      "title": "Droplet",
      "tags": ["test"],
      "context": {
        "type": "contextSsh",
        "config": {
          "host": "167.71.45.63",
          "port": 22,
          "username": "root",
          "privateKey": { "transform": "fileContents", "format": "buffer", "path": "/home/user/.ssh/id_rsa"}
        }
      }
    }
  ]
}
```
Task configuration
```JSON
{
  "tags": ["test"],
  "vars": {
    "value": "testValue"
  },
  "tasks": [
    {
      "type": "fileFromString",
      "title": "create file",
      "config": {
        "filename": "/tmp/templ.txt",
        "string": {
          "transform": "template",
          "template": {"transform": "fileContents", "format": "string", "path": "exampleFiles/test.tmpl"}
        }
      }
    }
  ]
}
```
Command
```shell
infco process -h hostConfig.json -t taskConfig.json
```
