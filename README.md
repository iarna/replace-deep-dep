# replace-deep-dep

Change a transitive dependency version without updating the things requiring it.

## USAGE

```console
$ npx replace-deep-dep example-module 1.0.5 1.1.0
replace-deep-dep: example-module@1.0.5 found and updated to 1.1.0
replace-deep-dep: package-lock.json updated
$ npm install
updated 1 package in 1.878s

```

## REQUIREMENTS

You must have a `package-lock.json` or an `npm-shrinkwrap.json` and it must
be created with an up-to-date npm (at least 5.3.0).

## CAVEATS

This tool is dangerous.

It lets you swap out the version of a transitive dependency for one that
doesn't match the `package.json` semver requirements.

## WHY

This specifically allows for the use case where a transitive dependency has
gotten a security update but the things requiring it have restrictive semver
patterns.

It also lets you downgrade packages that have had dangerous or broken patch
releases.

## WHY NOT

Installing packages that don't match the semver contract may break things. 
It's on you to ensure that they don't for your scenario.