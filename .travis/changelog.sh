#!/bin/bash

# Path to this file
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Path the script was called from
IPWD="$(pwd)"
# Import shared vars
. ${DIR}/_shared-vars.sh

echo
echo "+++ Check if changelog was updated +++"
echo


if [ "$TRAVIS_PULL_REQUEST" != "false" ] && [ "$TRAVIS_BRANCH" == "develop" ]; then
 curl https://raw.githubusercontent.com/h-da/geli/develop/CHANGELOG.md |
 diff CHANGELOG.md - | 
 grep -P '^< - .{8,100}' - -q 

 if [ $? ]; then
  echo "${GREEN}+ Update in CHANGELOG.md found, exit${NC}"
  else
   echo -e "${RED}+ ERROR: No Update in CHANGELOG.md found!"
   echo -e "+ Please check if a line was added in the CHANGELOG.md.${NC}"
   exit 1
  fi
elif [ "$TRAVIS_PULL_REQUEST" != "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
 curl https://raw.githubusercontent.com/h-da/geli/master/CHANGELOG.md |
 diff CHANGELOG.md - | 
 grep -P '^< ## \[\d\.\d\.\d\] - .{6,20}' - -q 

 if [ $? ]; then
  echo "${GREEN}+ Update in CHANGELOG.md found, exit${NC}"
  else
   echo -e "${RED}+ ERROR: No Update in CHANGELOG.md found!"
   echo -e "+ Please check if a new version was added in the CHANGELOG.md."
   echo -e "+ Or a new section for the next release was added${NC}"
   exit 1
  fi
else
  echo -e "${YELLOW}+ WARNING: No Pull Request agiainst Develop or Master -> skipping automate changelog checking${NC}";
fi
