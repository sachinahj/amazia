select *
from yelpCategory yc
join yelpCategoryTree yct on yct.aliasLevel4=yc.alias
;

select distinct(aliasLevel)
from yelpCategoryTree
;

SELECT *, count(aliasLevel4) as count
FROM yelpCategoryTree
GROUP BY aliasLevel4
HAVING (count > 1)
;

select yct.*
from yelpCategoryTree yct
join (
	SELECT *, count(aliasLevel4) as count
	FROM yelpCategoryTree
	GROUP BY aliasLevel4
	HAVING (count > 1)
) temp on temp.aliasLevel4=yct.aliasLevel4
;
