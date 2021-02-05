# console-check
Get console logs and errors for a list of urls.

## Install
```
npm i console-check -g
```

## Use
```
$ console-check --help

    NAME
      console-check -- Get console logs and errors for a list of urls.

    OPTIONS
      -k, --keep-open {ms} (default 1000) Milliseconds to wait until closing each page
      -c, --concurrency {n} (default 10)  Concurrency level

    EXAMPLES
      cat urls.txt | console-check
      echo 'https://example.com' | console-check
```
