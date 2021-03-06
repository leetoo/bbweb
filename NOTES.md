# Notes

- Should this be implemented for ID generation: [Embedding a Primary Key in a UUID / GUID for CQRS / ES]
  (http://rbtech.blogspot.ca/2013/10/embedding-primary-key-in-uuid-guid-for.html)

# Using REST

Install this: https://github.com/jakubroztocil/httpie

```bash
export TOKEN="141136cf-8e2b-4c92-9900-e0cd1ed07c19"

http POST localhost:9000/studies "Cookie:XSRF-TOKEN=$TOKEN" X-XSRF-TOKEN:$TOKEN name=ST1 description="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam"

export STUDY_ID="1A18C06C-D7FE-4D7D-8CBF-04BA9DD31CD6

http POST localhost:9000/studies/pannottype "Cookie:XSRF-TOKEN=$TOKEN" X-XSRF-TOKEN:$TOKEN studyId=$STUDY_ID name=PAT1 description="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam" valueType=Select maxValueCount:=1 options:='["abc", "def"]' required:=false

http POST localhost:9000/studies/pannottype "Cookie:XSRF-TOKEN=$TOKEN" X-XSRF-TOKEN:$TOKEN studyId=$STUDY_ID name=PAT5 description="Lorem ipsum dolor sit amet" valueType=Number maxValueCount:=0 options:='[]' required:=true

http POST localhost:9000/studies/sgroups "Cookie:XSRF-TOKEN=$TOKEN" X-XSRF-TOKEN:$TOKEN studyId=$STUDY_ID name=SG5 description="Lorem ipsum dolor sit amet" units="mL" anatomicalSourceType=Blood preservationType="Frozen Specimen" preservationTemperature="-80 C" specimenType="Buffy coat"

http POST localhost:9000/studies/cetypes "Cookie:XSRF-TOKEN=$TOKEN" X-XSRF-TOKEN:$TOKEN studyId=$STUDY_ID name=CET3 description="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam" recurring:=true specimenGroupData:='[{"specimenGroupId":"__ID_HERE__", "name":"__NAME_HERE__", "maxCount":1, "amount":1.0, "units":"__UNITS_HERE__"}]' annotationTypeData:='[]'

```

# Learning AngularjS #

https://github.com/jmcunningham/AngularJS-Learning

# Grids or Tables in AngularJS

http://stackoverflow.com/questions/21375073/best-way-to-represent-a-grid-or-table-in-angularjs-with-bootstrap-3

---

[Back to top](../README.md)
