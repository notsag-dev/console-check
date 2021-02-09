# console-check
Get console logs, warnings and errors for a list of urls. It uses a headless browser to navigate to the urls and capture console messages which are then sent to stdout with the following format:

```{url}:{ERROR | WARNING | LOG}:{message}```

## Install
```
npm i console-check -g
```

## Use
```
$ console-check --help

    NAME
      console-check -- Get console messages for a list of urls.

    OPTIONS
      -k, --keep-open {ms} (default 1000) Milliseconds to wait until closing each page
      -c, --concurrency {n} (default 10)  Max number of pages requested at the same time

    EXAMPLES
      cat urls.txt | console-check
      echo 'https://example.com' | console-check
```
